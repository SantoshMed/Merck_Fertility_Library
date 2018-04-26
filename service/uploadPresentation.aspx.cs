using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Spire.Presentation;
using Spire.Presentation.Collections;
using Spire.Presentation.Drawing;
using Spire.Presentation.Converter;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.IO;
using Medtrix.DataAccessControl;
using Medtrix.Trace;

public partial class uploadPresentation : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Dictionary<String, FileFormat> nl = new Dictionary<String, FileFormat>();
        nl.Add(".ppt", FileFormat.PPT);
        nl.Add(".pptx", FileFormat.Pptx2010);

        var presentationname = Request.Form["pname"];
        var metatag = Request.Form["metatag"];
        var categoryid = Request.Form["categoryid"];
        var file = Request.Files["file"];
        var desc = Request.Form["description"];

        if (file != null)
        {
            String ext = System.IO.Path.GetExtension(file.FileName).ToLower();

            DataCommand command = new DataCommand("createPresentation");
            command.Add("presentationname", presentationname);
            command.Add("categoryid", Convert.ToUInt64(categoryid));
            command.Add("metatag", metatag);
            command.Add("description", desc);
            command.Add("type", ext);
            command.Add("filename", file.FileName);

            DataSet ds = (DataSet)command.Execute(true);
            DataTable dt = ds.Tables[0];

            String presentatonId = dt.Rows[0]["presentationid"].ToString();

            file.SaveAs(Server.MapPath("~/Uploads/" + presentatonId + ext));

            try
            {
                Presentation presentation = new Presentation();
                presentation.LoadFromStream(file.InputStream, nl[ext]);
                var totalSlide = presentation.Slides.Count;
                //traverse the slides of PPT files
                for (int i = 0; i < presentation.Slides.Count; i++)
                {

                    ISlide slide = presentation.Slides[i];

                    String title = getTitle(slide);
                    title = title == null ? "No Title" : title;
                    DataCommand command1 = new DataCommand("createSlide");
                    command1.Add("slidename", title);
                    command1.Add("presentationid", presentatonId);
                    command1.Add("slideindex", i);

                    DataSet ds1 = (DataSet)command1.Execute(true);
                    DataTable dt1 = ds1.Tables[0];

                    String slideId = dt1.Rows[0]["slideid"].ToString();

                    //save the slide to Image
                    Image image = slide.SaveAsImage(960, 540);

                    String fileName = Server.MapPath("~/Uploads/Images/" + String.Format(slideId + ".jpeg", i));
                    image.Save(fileName, System.Drawing.Imaging.ImageFormat.Jpeg);

                    Image imageT = slide.SaveAsImage(320, 180);

                    fileName = Server.MapPath("~/Uploads/Thumbnails/" + String.Format(slideId + ".jpeg", i));
                    imageT.Save(fileName, System.Drawing.Imaging.ImageFormat.Jpeg);

                    Int32 precentageComplete = (i / totalSlide) * 100;
                    updatePresentationStatus(0, precentageComplete, presentatonId);
                }
                updatePresentationStatus(1, 100, presentatonId);
                Response.Write("Success");
            }
            catch (Exception ex)
            {
                updatePresentationStatus(2, 0, presentatonId);
                Response.Write(ex.Message);
            }
        }

    }

    public bool updatePresentationStatus(int status, int percentage, String presentationid)
    {
        DataCommand command1 = new DataCommand("updatePresentation");
        command1.Add("status", status);
        command1.Add("percentage", percentage);
        command1.Add("presentationid", presentationid);

        return command1.ExecuteNonQuery();
    }

    public String getTitle(ISlide slide)
    {
        String title = null;
        IShape titleShape = null;
        foreach (IShape shape in slide.Shapes)
        {
            if (shape.Placeholder != null)
            {
                switch (shape.Placeholder.Type)
                {
                    case PlaceholderType.Title:
                        titleShape = shape;
                        break;
                    case PlaceholderType.CenteredTitle:
                        titleShape = shape;
                        break;
                }
            }
        }
        if (titleShape != null)
        {
            IAutoShape shape1 = titleShape as IAutoShape;
            title = shape1.TextFrame.Text;
        }

        return title;
    }
}