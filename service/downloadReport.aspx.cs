using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Drawing;
using System.Text;
using System.IO;
using Medtrix.DataAccessControl;
using System.Runtime.Serialization.Formatters.Binary;
using OfficeOpenXml;

public partial class service_downloadReport : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        DataTable dt = null;
        String userid = Request.QueryString["userid"];
        String category = Request.QueryString["category"];
        String sdate = Request.QueryString["sdate"];
        String edate = Request.QueryString["edate"];
        String ReportName = "";

        if (!String.IsNullOrEmpty(userid))
        {
            DataCommand command = new DataCommand("getUserSlideReport");
            command.Add("userid", userid);
            DataSet ds = (DataSet)command.Execute(true);
            dt = ds.Tables[0];
            ReportName = dt.Rows.Count > 1 ? "User_Slide_Report" : "NoDate_Report";
        }
        else if (!String.IsNullOrEmpty(category))
        {
            DataCommand command = new DataCommand("getCategorySlideReport");
            command.Add("categoryid", category);
            DataSet ds = (DataSet)command.Execute(true);
            dt = ds.Tables[0];
            ReportName = dt.Rows.Count > 1 ? dt.Rows[0]["Category Name"].ToString() + "_Slide_Report" : "NoDate_Report";
        }
        else if (!String.IsNullOrEmpty(sdate) && !String.IsNullOrEmpty(edate))
        {
            DataCommand command = new DataCommand("getSlideReportByDate");
            command.Add("startdate", sdate);
            command.Add("enddate", edate);
            DataSet ds = (DataSet)command.Execute(true);
            dt = ds.Tables[0];
            ReportName = dt.Rows.Count > 1 ? "Custom_Slide_Report" : "NoDate_Report";
        }
        else
        {
            DataCommand command = new DataCommand("getSlideReport");
            DataSet ds = (DataSet)command.Execute(true);
            dt = ds.Tables[0];
            ReportName = dt.Rows.Count > 1 ? "Slide_Report" : "NoDate_Report";
        }


        if (dt != null)
        {
            Response.Clear();
            Response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            Response.AddHeader("content-disposition", "attachment;filename=" + HttpUtility.UrlEncode(ReportName + ".xlsx", System.Text.Encoding.UTF8));

            using (ExcelPackage pck = new ExcelPackage())
            {
                ExcelWorksheet ws = pck.Workbook.Worksheets.Add("Logs");
                ws.Cells["A1"].LoadFromDataTable(dt, true);
                ws.Cells.AutoFitColumns();
                ws.Cells["A1:G1"].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                ws.Cells["A1:G1"].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(82, 46, 144));
                ws.Cells["A1:G1"].Style.Font.Color.SetColor(Color.White);
                ws.Cells["A1:G1"].Style.Font.Bold = true;
                var ms = new System.IO.MemoryStream();
                pck.SaveAs(ms);
                ms.WriteTo(Response.OutputStream);
            }
        }
    }

}