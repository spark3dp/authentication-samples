package spark;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.google.common.collect.ImmutableMap;


public class SparkOauthServer {

	private Server server = new Server(Config.PORT);
	private String templateString = "";
    private String ACCESS_TOKEN_KEY = "java_auth_sample_spark_access_token";
    private String GUEST_TOKEN_KEY = "java_auth_sample_spark_guest_token";
    private String REFRESH_TOKEN_KEY = "java_auth_sample_spark_refresh_token";


    public static void main(String[] args) throws Exception {
        //templateString = getTemplateString();
        new SparkOauthServer().startJetty();
	}

    private void setTemplateString() throws IOException {
        BufferedReader br = new BufferedReader(new FileReader("spark-template.html"));
        try {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();

            while (line != null) {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            templateString = sb.toString();
        } finally {
            br.close();
        }
    }

	public void startJetty() throws Exception {

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);
 
        // map servlets to endpoints
        context.addServlet(new ServletHolder(new IndexServlet()),"/");
        context.addServlet(new ServletHolder(new SigninServlet()),"/signin");        
        context.addServlet(new ServletHolder(new CallbackServlet()),"/callback");
        context.addServlet(new ServletHolder(new LogoutServlet()), "/logout");
        context.addServlet(new ServletHolder(new GuestTokenServlet()), "/guest");
        context.addServlet(new ServletHolder(new RefreshTokenServlet()), "/refresh");

        System.out.println("To start, go to: http://localhost:8089/");

        setTemplateString();

        server.start();

        server.join();

    }

    public String getAuthorizationHeader(String appId,String appSecret){

        String authorizationStr = (appId+":"+ appSecret);
        byte[]   bytesEncoded = Base64.encodeBase64(authorizationStr.getBytes());
        String authorizationEncoded = "Basic " + new String(bytesEncoded) ;

        return  authorizationEncoded;
    }


    class IndexServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {
            resp.getWriter().println(templateString);
        }
    }

	class SigninServlet extends HttpServlet {
		@Override
		protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {
		// redirect to Spark for authorization
		StringBuilder oauthUrl = new StringBuilder().append(Config.LOGIN_URI)
			.append("?client_id=").append(Config.CLIENT_ID)
			.append("&response_type=code");
			resp.sendRedirect(oauthUrl.toString());
		}	
	}

    class GuestTokenServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {
            String authorizationEncoded = getAuthorizationHeader(Config.CLIENT_ID,Config.CLIENT_SECRET);

            String body = post(Config.TOKEN_URI, ImmutableMap.<String, String>builder()
                            .put("grant_type", "client_credentials").build(),
                    ImmutableMap.<String, String>builder().put("Authorization", authorizationEncoded).build());

            JSONObject jsonObject = null;

            // get the access token from json
            try {
                jsonObject = (JSONObject) new JSONParser().parse(body);
            } catch (ParseException e) {
                throw new RuntimeException("Unable to parse json " + body);
            }

            System.out.println("Response from Spark:"+jsonObject.toJSONString());

            String guestToken = (String) jsonObject.get("access_token");

            // store the token in a cookie
            resp.addCookie(new Cookie(GUEST_TOKEN_KEY,guestToken));

            resp.sendRedirect("/");
        }
    }


    class RefreshTokenServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {
            String authorizationEncoded = getAuthorizationHeader(Config.CLIENT_ID,Config.CLIENT_SECRET);

            String body = post(Config.REFRESH_TOKEN_URI, ImmutableMap.<String, String>builder()
                            .put("grant_type", "refresh_token")
                            .put("refresh_token", req.getParameter("refresh_token")).build(),
                    ImmutableMap.<String, String>builder().put("Authorization", authorizationEncoded).build());

            JSONObject jsonObject = null;

            // get the access token from json
            try {
                jsonObject = (JSONObject) new JSONParser().parse(body);
            } catch (ParseException e) {
                throw new RuntimeException("Unable to parse json " + body);
            }

            System.out.println("Response from Spark:"+jsonObject.toJSONString());

            String accessToken = (String) jsonObject.get("access_token");
            String refreshToken = (String) jsonObject.get("refresh_token");

            // store the token in a cookie
            resp.addCookie(new Cookie(ACCESS_TOKEN_KEY,accessToken));
            resp.addCookie(new Cookie(REFRESH_TOKEN_KEY,refreshToken));

            resp.sendRedirect("/");
        }
    }
	
	class CallbackServlet extends HttpServlet {
		@Override
		protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {
			
			if (req.getParameter("error") != null) {
				resp.getWriter().println(req.getParameter("error"));
				return;
			}

            String code = req.getParameter("code");
            String authorizationEncoded = getAuthorizationHeader(Config.CLIENT_ID,Config.CLIENT_SECRET);

			// get the access token by post to Spark
			String body = post(Config.TOKEN_URI, ImmutableMap.<String,String>builder()
					.put("code", code).put("response_type", "code").put("grant_type", "authorization_code").build(),
					ImmutableMap.<String,String>builder().put("Authorization", authorizationEncoded).build());

			
			JSONObject jsonObject = null;
			
			// get the access token from json
			try {
				jsonObject = (JSONObject) new JSONParser().parse(body);
			} catch (ParseException e) {
				throw new RuntimeException("Unable to parse json " + body);
			}

            System.out.println("Response from Spark:"+jsonObject.toJSONString());

			String accessToken = (String) jsonObject.get("access_token");
            String refreshToken = (String) jsonObject.get("refresh_token");

			// store the token in a cookie
            resp.addCookie(new Cookie(ACCESS_TOKEN_KEY,accessToken));
            resp.addCookie(new Cookie(REFRESH_TOKEN_KEY,refreshToken));

            resp.sendRedirect("/");
		}	
	}


    class LogoutServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {

            Cookie cookie1 = new Cookie(ACCESS_TOKEN_KEY,"");
            cookie1.setMaxAge(0);
            Cookie cookie2 = new Cookie(REFRESH_TOKEN_KEY,"");
            cookie2.setMaxAge(0);

            resp.addCookie(cookie1);
            resp.addCookie(cookie2);

            resp.sendRedirect("/");
        }
    }
	
	// makes a GET request to url and returns body as a string
	public String get(String url) throws ClientProtocolException, IOException {
		return execute(new HttpGet(url));
	}
	
	// makes a POST request to url with form parameters and returns body as a string
	public String post(String url, Map<String,String> formParameters,Map<String,String> headers) throws ClientProtocolException, IOException {	
		HttpPost request = new HttpPost(url);
		
		List <NameValuePair> nvps = new ArrayList <NameValuePair>();

        for(String key: headers.keySet()){
            request.setHeader(key, headers.get(key));
        }

		for (String key : formParameters.keySet()) {
			nvps.add(new BasicNameValuePair(key, formParameters.get(key)));	
		}

		request.setEntity(new UrlEncodedFormEntity(nvps));

		return execute(request);
	}
	
	// makes request and checks response code for 200
	private String execute(HttpRequestBase request) throws ClientProtocolException, IOException {
		HttpClient httpClient = new DefaultHttpClient();
		HttpResponse response = httpClient.execute(request);
	    
		HttpEntity entity = response.getEntity();
	    String body = EntityUtils.toString(entity);

		if (response.getStatusLine().getStatusCode() != 200) {
			throw new RuntimeException("Expected 200 but got " + response.getStatusLine().getStatusCode() + ", with body " + body);
		}

	    return body;
	}
}
