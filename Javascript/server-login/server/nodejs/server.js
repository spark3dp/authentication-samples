//provide environment through console i.e. ENV=beta node server.js
var env = process.env.ENV || 'local',
	port = process.env.PORT || 3000,
	config = require('./config.js'),
	API_SERVER = (env === 'prod' ? 'api.spark.autodesk.com/api/v1' : 'https://sandbox.spark.autodesk.com/api/v1');


if (isNaN(port)){
	port = 3000;
}

//setup express + request
var express = require('express'),
	app = express(),
	request = require('request');



/**
 * Encode string in base64
 * @param str
 * @returns {*}
 */
var toBase64 = function(str){
	return new Buffer(str).toString('base64');
}


//Enable CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// Access token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token
app.get('/access_token', function(req, res){

	var code = req.query.code,
		redirect_uri = req.query.redirect_uri,
		url = API_SERVER + '/oauth/accesstoken',
		params = "code=" + code + "&grant_type=authorization_code&response_type=code";

	if (redirect_uri){
		params += "&redirect_uri=" +  redirect_uri;
	}

	var contentLength = params.length,
		headers = {
			'Authorization': 'Basic ' + toBase64(config.APP_KEY + ':' + config.APP_SECRET),
			'Content-Type' : 'application/x-www-form-urlencoded',
			'Content-Length': contentLength
		};

	//call the accesstoken endpoint
	request({
		headers: headers,
		uri: url,
		body: params,
		method: 'POST'
	}, function (err, result, body) {

		//return the guest token object (json)
		res.send(body);
	});


});

// Guest token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Fguest-token
app.get('/guest_token', function(req, res){
	var url = API_SERVER + '/oauth/accesstoken',
		params = "grant_type=client_credentials",
		contentLength = params.length,
	 	headers = {
			'Authorization': 'Basic ' + toBase64(config.APP_KEY + ':' + config.APP_SECRET),
			'Content-Type' : 'application/x-www-form-urlencoded',
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
app.get('/refresh_token', function(req, res) {
	var url = API_SERVER + '/oauth/refreshtoken',
		params = "grant_type=refresh_token&refresh_token=" + req.query.refresh_token,
		contentLength = params.length,
		headers = {
			'Authorization': 'Basic ' + toBase64(config.APP_KEY + ':' + config.APP_SECRET),
			'Content-Type' : 'application/x-www-form-urlencoded',
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
		res.send(body);
	});
});

app.listen(port);

console.log('Express server started on port ' + port);