//Init the Spark Client - you may supply your personal config through the assets/scripts/config.js file
var APP_KEY = APP_KEY || '',
	GUEST_TOKEN_URL = SERVER_URL ? SERVER_URL + '/guest_token' : 'http://localhost:3000/guest_token',
	ACCESS_TOKEN_URL = SERVER_URL ? SERVER_URL + '/access_token' : 'http://localhost:3000/access_token',
	REFRESH_TOKEN_URL = SERVER_URL ? SERVER_URL + '/refresh_token' : 'http://localhost:3000/refresh_token',
	REDIRECT_URI = REDIRECT_URI || '';

var isProd = (ENVIRONMENT == "sandbox") ? false : true;

var options = {
	isProduction: isProd,
	redirectUri: REDIRECT_URI,
	guestTokenUrl: GUEST_TOKEN_URL,
	accessTokenUrl: ACCESS_TOKEN_URL,
	refreshTokenUrl: REFRESH_TOKEN_URL
};

ADSKSpark.Client.initialize(APP_KEY, options);