 Implicit Login flow
========================
### Introduction
This sample code demonstrates Spark's _Implicit Login_: App and user authentication based on the OAuth2 protocol.

### Prerequisites
* A registered app on the <a href="https://spark.autodesk.com/developers/" target="_blank">Spark Developers' Portal</a>. For more information see the <a href="https://spark.autodesk.com/developers/reference/introduction/tutorials/register-an-app" target="_blank">tutorial</a>.


### Installation
* Include the SDK library in your HTML page, just before closing the body section (`</body>`).

```HTML
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-0.1.0.min.js"></script>
```


### Quick Start
##### Step 1 - Initialize Client
You initialize the SDK JS Client with the APP_KEY that was provided during app registration.

```JavaScript
ADSKSpark.Client.initialize('<your-app-key>'));
```

##### Step 2 - Login Dialog
You load the Login Dialog window for the user to login.

```JavaScript
	//Open login window
	function login() {
		ADSKSpark.Client.openLoginWindow();
	}
```

##### Step 3 - Handle Login / Access Token Callback
The access token will be returned to one of the following:<br>
1. The page that loaded the login window (<b>the sample code's default setting</b>).<br>
2. The (optional) redirect URI you supplied in initialize (see Additional Configuration section).<br>
3. The callback URL you defined in app registration.<br>

```JavaScript
ADSKSpark.Client.completeLogin(false).then(function (token) {
		if (token) {
			if (window.opener) {
				window.opener.location.reload(true);
				//close the login window
				window.close();
			} else {
				window.parent.location.reload();
			}
		} else {
			console.error('Problem with fetching token');
		}
	});
```

### Additional Configuration
##### Adding an Options Configuration
You can send optional parameters to the initialization method:

```JavaScript
 var options = {
isProduction:false, //(Optional - true/false) Whether your app runs in production or the sandbox test environment. The default is sandbox.
redirectUri: '',// (Optional) The redirect URI for the auth service (i.e. http://example.com/callback), in cases where it is different to the Callback URL you defined in the app registration screen.
guestTokenUrl: '',//(Optional) The server URL to which guest token requests will be directed, for example http://example.com/guest_token.
accessTokenUrl: '',//(Optional) The server URL to which access token requests will be directed, for example http://example.com/access_token.
refreshTokenUrl: ''//(Optional) The server URL to which refresh access token requests will be directed.
    };

ADSKSpark.Client.initialize('<your-app-key>',options);
```
<b>isProduction</b> - isSandbox or isProduction, this parameter initializes the client for the desired environment.<br>
<i>Note!</i>  Each environment uses a different APP_KEY.

<b>redirectUri</b> - The redirect URI to which the access_token is returned.
The redirect URI must match the callback URL defined during app registration.
If no redirectUri is entered, the access token is retured to the page that loaded the login dialog.

### Complete Sample Code
```HTML
 <!DOCTYPE html>
<html lang="en">
<head>
	<title>Spark Sample Application - Implicit Login</title>
	<meta charset="utf-8">
	<!-- Bootstrap core CSS -->
	<link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet">
</head>

<body>

<div class="container">
	<div class="col-md-12">
		<p class="token-wrapper" id="access-token">Access Token: <b id="access-token-span">none</b></p>
		<a onclick="login()" id="login" class="btn btn-primary">Login to Get an Access Token (Implicit)</a>
		<a onclick="logout()" id="logout" class="btn btn-primary">Logout</a>
	</div>
</div>

<script type="text/javascript" charset="utf-8" src="//code.jquery.com/jquery-2.1.3.min.js"></script>
<!-- include the SPARK JS SDK -->
<script type="text/javascript" src="//code.spark.autodesk.com/autodesk-spark-sdk-0.1.0.min.js"></script>
<script>

	// Initialize Spark client
	ADSKSpark.Client.initialize('<your-app-key>');

	//Open login window
	function login() {
		ADSKSpark.Client.openLoginWindow();
	}

	//Logout button function
	function logout() {
		ADSKSpark.Client.logout();
		location.reload();
	}

	//Complete the login flow after the redirect from Authentication.
	ADSKSpark.Client.completeLogin(false).then(function (token) {
		// Get the access_token
		if (token) {
			if (window.opener) {

				window.opener.location.reload(true);
				//close the login window
				window.close();
			} else {
				window.parent.location.reload();
			}
		} else {
			console.error('Problem with fetching token');
		}

	}, function (error) {
		console.error(error);
	});

	// Checks on load/reload if the Access_token exists in local storage.
	if (ADSKSpark.Client.isAccessTokenValid()) {
		$('#access-token-span').text(ADSKSpark.Client.getAccessToken());
		$('#login').hide();
		$('#logout').css('display', 'inline-block');
	}
</script>
</body>
</html>
```
