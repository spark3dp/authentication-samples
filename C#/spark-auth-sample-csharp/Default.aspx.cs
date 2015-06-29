using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.Net;
using System.IO;
using System.Text;

namespace spark_auth_sample_csharp
{
    public partial class Default : Page
    {
        // Hard coded app and secret keys and base URL.
        // In real world Apps, these values need to be secured and preferably not hardcoded.
        private const string m_AppKey = "INSERT_APP_KEY_HERE";
        private const string m_AppSecret = "INSERT_SECRET_HERE";
        private const string m_baseURL = "https://sandbox.spark.autodesk.com/api/v1";

        //you need to change the domain name and port number if you are using different ones.
        private const string m_CallbackURL = "http://localhost:52854/Default.aspx";

        protected void Page_Load(object sender, EventArgs e)
        {
            if (IsPostBack == false)
            {
                if (Request.Cookies["csharp_auth_sample_spark_access_token"] != null)
                {
                    btnLogin.Visible = false;
                    lblAccessToken.Text = Request.Cookies["csharp_auth_sample_spark_access_token"].Value;
                }
                else
                {
                    lblAccessToken.Text = "none";
                    btnRefreshToken.Visible = false;
                    btnLogout.Visible = false;
                }
                if (Request.Cookies["csharp_auth_sample_spark_refresh_token"] != null)
                {
                    lblRefreshToken.Text = Request.Cookies["csharp_auth_sample_spark_refresh_token"].Value;
                }
                else
                {
                    lblRefreshToken.Text = "none";
                }
                if (Request.Cookies["csharp_auth_sample_spark_guest_token"] != null)
                {
                    lblGuestToken.Text = Request.Cookies["csharp_auth_sample_spark_guest_token"].Value;
                }
                else
                {
                    lblGuestToken.Text = "none";
                }

                //get the code parameter from callback url
                if (Request.Url.ToString().IndexOf("code") > 0)
                {
                    var qs = HttpUtility.ParseQueryString(Request.Url.Query);
                    string code = qs["code"];
                    if (code != String.Empty)
                    {
                        getAccessToken(code);
                        btnLogin.Visible = false;
                        btnLogout.Visible = true;
                        btnRefreshToken.Visible = true;
                    }
                }
            }
        }

        //redirect to spark signin/signup page
        protected void btnLogin_Click(object sender, EventArgs e)
        {
            string spark_url = m_baseURL + "/oauth/authorize?response_type=code&client_id=" + m_AppKey + "&redirect_uri=" + m_CallbackURL;
            Response.Redirect(spark_url);
        }

        protected void btnLogout_Click(object sender, EventArgs e)
        {
            Response.Cookies["csharp_auth_sample_spark_access_token"].Value = String.Empty;
            Response.Cookies["csharp_auth_sample_spark_refresh_token"].Value = String.Empty;
            Response.Cookies["csharp_auth_sample_spark_guest_token"].Value = String.Empty;
            lblAccessToken.Text = "none";
            lblRefreshToken.Text = "none";
            lblGuestToken.Text = "none";
            btnRefreshToken.Visible = false;
            btnLogout.Visible = false;
            btnLogin.Visible = true;
        }

        protected void btnRefreshToken_Click(object sender, EventArgs e)
        {
            string result = String.Empty;

            var request = (HttpWebRequest)WebRequest.Create(m_baseURL + "/oauth/refreshtoken");

            var postData = "refresh_token=" + Request.Cookies["csharp_auth_sample_spark_refresh_token"].Value + "&grant_type=refresh_token";

            var data = Encoding.ASCII.GetBytes(postData);

            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = data.Length;
            request.Headers.Add("Authorization", "Basic " + Base64Encode(m_AppKey + ":" + m_AppSecret));

            using (var stream = request.GetRequestStream())
            {
                stream.Write(data, 0, data.Length);
            }

            var response = (HttpWebResponse)request.GetResponse();

            var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();

            JavaScriptSerializer json = new JavaScriptSerializer();

            Dictionary<string, string> sData = json.Deserialize<Dictionary<string, string>>(responseString);

            HttpCookie accessTokenCookie = new HttpCookie("csharp_auth_sample_spark_access_token", sData["access_token"].ToString());
            accessTokenCookie.Expires = DateTime.Now.AddDays(1d);
            Response.Cookies.Add(accessTokenCookie);

            HttpCookie refreshTokenCookie = new HttpCookie("csharp_auth_sample_spark_refresh_token", sData["refresh_token"].ToString());
            refreshTokenCookie.Expires = DateTime.Now.AddDays(1d);
            Response.Cookies.Add(refreshTokenCookie);

            lblAccessToken.Text = sData["access_token"].ToString(); ;
            lblRefreshToken.Text = sData["refresh_token"].ToString();
        }

        protected void btnGuestToken_Click(object sender, EventArgs e)
        {
            string result = String.Empty;

            var request = (HttpWebRequest)WebRequest.Create(m_baseURL + "/oauth/accesstoken");

            var postData = "grant_type=client_credentials";

            var data = Encoding.ASCII.GetBytes(postData);

            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = data.Length;
            request.Headers.Add("Authorization", "Basic " + Base64Encode(m_AppKey + ":" + m_AppSecret));

            using (var stream = request.GetRequestStream())
            {
                stream.Write(data, 0, data.Length);
            }

            var response = (HttpWebResponse)request.GetResponse();

            var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();

            JavaScriptSerializer json = new JavaScriptSerializer();

            Dictionary<string, string> sData = json.Deserialize<Dictionary<string, string>>(responseString);
            HttpCookie guestTokenCookie = new HttpCookie("csharp_auth_sample_spark_guest_token", sData["access_token"].ToString());
            guestTokenCookie.Expires = DateTime.Now.AddDays(1d);
            Response.Cookies.Add(guestTokenCookie);
            lblGuestToken.Text = sData["access_token"].ToString();
        }

        private void getAccessToken(string code)
        {
            string result = String.Empty;

            var request = (HttpWebRequest)WebRequest.Create(m_baseURL + "/oauth/accesstoken");

            var postData = "redirect_uri=" + m_CallbackURL + "&code=" + code + "&grant_type=authorization_code&response_type=code";

            var data = Encoding.ASCII.GetBytes(postData);

            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = data.Length;
            request.Headers.Add("Authorization", "Basic " + Base64Encode(m_AppKey + ":" + m_AppSecret));

            using (var stream = request.GetRequestStream())
            {
                stream.Write(data, 0, data.Length);
            }

            var response = (HttpWebResponse)request.GetResponse();

            var responseString = new StreamReader(response.GetResponseStream()).ReadToEnd();

            JavaScriptSerializer json = new JavaScriptSerializer();

            Dictionary<string, string> sData = json.Deserialize<Dictionary<string, string>>(responseString);

            HttpCookie accessTokenCookie = new HttpCookie("csharp_auth_sample_spark_access_token", sData["access_token"].ToString());
            accessTokenCookie.Expires = DateTime.Now.AddDays(1d);
            Response.Cookies.Add(accessTokenCookie);

            HttpCookie refreshTokenCookie = new HttpCookie("csharp_auth_sample_spark_refresh_token", sData["refresh_token"].ToString());
            refreshTokenCookie.Expires = DateTime.Now.AddDays(1d);
            Response.Cookies.Add(refreshTokenCookie);

            lblAccessToken.Text = sData["access_token"].ToString(); ;
            lblRefreshToken.Text = sData["refresh_token"].ToString();
        }

        private string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }
    }
}