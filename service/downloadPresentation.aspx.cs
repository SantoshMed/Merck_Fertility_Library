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

public partial class service_downloadActive : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        var presentationid = Request.QueryString["id"];
        if (presentationid != null)
        {
            DataCommand command = new DataCommand("getAllSlides");
            command.Add("presentationid", Convert.ToUInt64(presentationid));

            DataSet ds = (DataSet)command.Execute(true);
            DataTable dt = ds.Tables[0];
            Presentation newP = new Presentation();
            newP.SlideSize.Type = SlideSizeType.Custom;
            newP.SlideSize.SizeOfPx = new SizeF(1280, 720);
            newP.SlideSize.Orientation = SlideOrienation.Landscape;
            Presentation helper = new Presentation();
            var pname = "";
            dt.DefaultView.Sort = "slideindex";
            dt = dt.DefaultView.ToTable();
            if (dt.Rows.Count > 0)
            {
                for (Int32 index = 0; index < dt.Rows.Count; index++)
                {
                    DataRow dr = dt.Rows[index];
                    var presentationName = presentationid + dr["type"].ToString();
                    Int32 slideIndex = Convert.ToInt32(dr["slideindex"].ToString());
                    Int32 orderNumber = index;
                    if (index == 0)
                    {
                        helper.LoadFromFile(Server.MapPath("~/Uploads/" + presentationName)); //loading ppt file
                        pname = presentationName;
                    }
                    ISlide orgSlide = helper.Slides[slideIndex]; // reading the slide

                    newP.Slides.Insert(orderNumber, orgSlide);
                    addTracking(Convert.ToUInt64(dr["slideid"].ToString())); // inserting in to new ppt
                }

                //newP.SaveToFile(Server.MapPath("~/Uploads/tt.ppt"), FileFormat.PPT);

                Byte[] Content = newP.GetBytes();

                Response.ContentType = "application/octet-stream";
                Response.AddHeader("content-disposition", "attachment; filename=" + dt.Rows[0]["presentationname"].ToString() + ".pptx");
                Response.BufferOutput = true;
                Response.OutputStream.Write(Content, 0, Content.Length);
                Response.End(); //downloading it
            }
        }
        
    }

    public void addTracking(UInt64 Id)
    {
        DataCommand trackingCommand = new DataCommand("addTrackingEntry");
        trackingCommand.Add("slideid", Id);
        trackingCommand.Add("userid", 0);
        trackingCommand.Add("viewed", 0);
        trackingCommand.Add("searched", 0);
        trackingCommand.Add("downloaded", 1);
        trackingCommand.ExecuteNonQuery();
    }

}