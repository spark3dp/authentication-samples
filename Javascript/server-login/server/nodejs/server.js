// Provide environment through console i.e. ENV=beta node server.js
var env = process.env.ENV || 'local',
	port = process.env.PORT || 3000,
	API_SERVER = (env === 'prod' ? 'https://api.spark.autodesk.com/api/v1' : 'https://sandbox.spark.autodesk.com/api/v1'),
	config = require('./config.js');

//Make sure port is a number
if (isNaN(port)) {
	port = 3000;
}

// Setup dependencies
var express = require('express'),
	app = express(),
	request = require('request'),
	session = require('express-session'),
	cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(session({
		cookie: {maxAge: 720000000},
		resave: false,
		saveUninitialized: false,
		secret: 'spark secret string'
	})
);

/**
 * Encode a string in base64.
 *
 * @param {String} s - The string to encode.
 * @returns {String} - The base64 encoding of s.
 */
var toBase64 = function (s) {
	return new Buffer(s).toString('base64');
};

// Enable CORS
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Authorization, Content-Type, Accept');
	next();
});


// Access token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token
app.get('/access_token', function (req, res) {

	var code = req.query.code,
		redirect_uri = req.query.redirect_uri,
		url = API_SERVER + '/oauth/accesstoken',
		params = "code=" + code + "&grant_type=authorization_code&response_type=code";

	if (redirect_uri) {
		params += "&redirect_uri=" + redirect_uri;
	}

	var contentLength = params.length,
		headers = {
			'Authorization': 'Basic ' + toBase64(config.APP_KEY + ':' + config.APP_SECRET),
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': contentLength
		};

	//call the accesstoken endpoint
	request({
		headers: headers,
		uri: url,
		body: params,
		method: 'POST'
	}, function (err, result, body) {
		//return the access token object (json)
		var resp = JSON.parse(body);

		if (resp.refresh_token) {
			req.session.refresh_token = JSON.parse(JSON.stringify(resp.refresh_token));
		}

		res.send(resp);
	});
});

// Guest token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Fguest-token
app.get('/guest_token', function (req, res) {
	var url = API_SERVER + '/oauth/accesstoken',
		params = "grant_type=client_credentials",
		contentLength = params.length,
		headers = {
			'Authorization': 'Basic ' + toBase64(config.APP_KEY + ':' + config.APP_SECRET),
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': contentLength
		};

	//call the accesstoken endpoint
	request({
		headers: headers,
		uri: url,
		body: params,
		method: 'POST'
	}, function (err, result, body) {

		//return the access token object (json)
		res.send(body);
	});
});

// Refresh token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token-refresh
app.get('/refresh_token', function (req, res) {
	console.log("session is:", req.session);
	var url = API_SERVER + '/oauth/refreshtoken',
		params = "grant_type=refresh_token&refresh_token=" + req.session.refresh_token,
		contentLength = params.length,
		headers = {
			'Authorization': 'Basic ' + toBase64(config.APP_KEY + ':' + config.APP_SECRET),
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': contentLength
		};

	//call the refreshtoken endpoint
	request({
		headers: headers,
		uri: url,
		body: params,
		method: 'POST'
	}, function (err, result, body) {
		//return the access token object (json)
		var resp = JSON.parse(body);

		if (resp.refresh_token) {
			req.session.refresh_token = JSON.parse(JSON.stringify(resp.refresh_token));
		}

		res.send(resp);
	});
});

app.listen(port);

console.log('Express server started on port ' + port);