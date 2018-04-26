using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Medtrix.WebService;

public partial class service_WebService : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        String reqPacket = System.Text.Encoding.UTF8.GetString(Request.BinaryRead(Request.ContentLength));
        //Medtrix.Trace.Logger.Log(reqPacket);
        String resPacket = ServiceManager.DoService(reqPacket, this);
        //Medtrix.Trace.Logger.Log(resPacket);
        Response.Write(resPacket);
    }
}