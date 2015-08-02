This tutorial describes how to run the Objective C version of the quick start app.
The app generates an access token, authenticating the app user and giving full access to the Spark APIs for a single session.
It can also be used to generate a guest token and to refresh an access token. 
For more information about authentication see our Authentication API.

To run this sample app, you must register an app on the Spark developers' portal.

1) Download the sample apps from https://github.com/spark3dp/authentication-samples and copy the Objective C folder. 

2) Locate the _AppDelegate.m_ file in the Objective C folder, _Spark-sdk-demo_ and change the following:<br>
    Under - (BOOL)application: didFinishLaunchingWithOptions:
<ul>
  <li> Set appKey to the App Key provided when you registered your app on the Spark developers' portal.</li>
  <li> Set appSecret to the App Secret provided when you registered your app on the Spark developers' portal.</li>
</ul>	
```C
// In real world apps, these values need to be secured and not hardcoded.
NSString *appKey = "INSERT_APP_KEY_HERE";
NSString *appSecret = "INSERT_SECRET_HERE";
```

3)  To use the Spark SDK, initialize the "SparkManager".
```C
[[SparkManager sharedInstance] initKey:appKey appSecret:appSecret envType:SPARK_ENV_TYPE_SANBOX];
[[SparkManager sharedInstance] setDebugMode:YES]; 
```

4) Run the project.</br>
Note:</br>
The first tab handles Spark Authentication.</br>
The second tab handles Spark Drive.
