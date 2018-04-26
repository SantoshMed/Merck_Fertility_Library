using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Net.Mime;
using System.Media;
using System.IO;
using Medtrix.DataAccessControl;
using Medtrix.Trace;

public partial class service_getImage : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
	    String docPath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Uploads\");

        UInt64 Id = Convert.ToUInt64(Request.QueryString["id"]);
        String Type = Request.QueryString["type"];
        string fileName = "";
        if (Type == null)
        {
            fileName = docPath + @"Images\"  + Id + ".jpeg";
            addTracking(Id);
        }
        else
        {
            fileName = docPath + @"Thumbnails\"  +  + Id + ".jpeg";
        }
	
        Response.ContentType = "image/jpeg";
        Response.WriteFile(fileName);

    }

    public void addTracking(UInt64 Id)
    {
        DataCommand trackingCommand = new DataCommand("addTrackingEntry");
        trackingCommand.Add("slideid", Id);
        trackingCommand.Add("viewed", 1);
        trackingCommand.Add("userid", 0);
        trackingCommand.Add("searched", 0);
        trackingCommand.Add("downloaded", 0);
        trackingCommand.ExecuteNonQuery();
    }
}