package spark;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

	private Server server = new Server(8089);
	
	public static void main(String[] args) throws Exception {
		new SparkOauthServer().startJetty();
	}
	
	public void startJetty() throws Exception {

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);
 
        // map servlets to endpoints
        context.addServlet(new ServletHolder(new SigninServlet()),"/signin");        
        context.addServlet(new ServletHolder(new CallbackServlet()),"/callback");

        System.out.println("To start, go to: http://localhost:8089/signin");

        server.start();

        server.join();

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
	
	class CallbackServlet extends HttpServlet {
		@Override
		protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException,IOException {
			
			if (req.getParameter("error") != null) {
				resp.getWriter().println(req.getParameter("error"));
				return;
			}
			
			// Spark returns a code that can be exchanged for a access token
			String code = req.getParameter("code");
			String authorizationStr = (Config.CLIENT_ID+":"+ Config.CLIENT_SECRET);
			
			byte[]   bytesEncoded = Base64.encodeBase64(authorizationStr.getBytes());
			
			String authorizationEncoded = "Basic " + new String(bytesEncoded) ; 
			System.out.println("Authorization header is: " + authorizationEncoded );

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

			// store the token in a cookie
            resp.addCookie(new Cookie("java_auth_sample_spark_access_token",accessToken));


			resp.getWriter().println("Your accessToken is: " +accessToken + "\n");
            resp.getWriter().println("Your accessToken is now also set in a cookie for a future use.");
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
