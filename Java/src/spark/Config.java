package spark;

/**
 * Created by michael on 6/17/15.
 */
public class Config {

    //TODO: in your app settings(in Developer Portal) you should change your "Callback URL" field to "http://localhost:8089/"

    //TODO: enter your CLIENT_ID from Developer Portal App page
    public static String CLIENT_ID="YOUR_APP_KEY";

    //TODO: enter your CLIENT_SECRET from Developer Portal App page
    public static String CLIENT_SECRET ="YOUR_APP_SECRET";

    public static String SPARK_ENDPOINT = "https://sandbox.spark.autodesk.com";
    public static String LOGIN_URI= SPARK_ENDPOINT + "/api/v1/oauth/authorize";
    public static String TOKEN_URI= SPARK_ENDPOINT + "/api/v1/oauth/accesstoken";
    public static String REFRESH_TOKEN_URI= SPARK_ENDPOINT + "/api/v1/oauth/refreshtoken";
    public static int PORT = 8089;

}
