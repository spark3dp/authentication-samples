var config = require('./config.js');

var APP_KEY = config.APP_KEY,
    APP_SECRET = config.APP_SECRET,
    REDIRECT_URI = config.REDIRECT_URI,
    API_URL = (console.ENV === 'production')  ? 'https://api.spark.autodesk.com/api/v1' 
                                              : 'https://sandbox.spark.autodesk.com/api/v1';


/**
 * Encode string in base64
 * @param str
 * @returns {*}
 */
var toBase64 = function(str){
  return new Buffer(str).toString('base64');
}


var express = require('express'),
    request = require('request');
    app = express();

app.set('views', './views')
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var accessToken = null;
var guestToken = null;

var authorization_uri = API_URL + 
                '/oauth/authorize' +
                '?response_type=code' +
                '&client_id=' + APP_KEY + 
                '&redirect_uri=' + REDIRECT_URI;


// Show the index page
app.get('/', function (req, res) {
  res.render('index.html',{accessToken:accessToken,guestToken:guestToken});
});

// Initial page redirecting to Spark Login
app.get('/auth', function (req, res) {
    res.redirect(authorization_uri);
});

// Callback service parsing the authorization token and asking for the access token
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token
app.get('/callback', function (req, res) {

  var code = req.query.code,
      url = API_URL + '/oauth/accesstoken',
      params = "code=" + code + "&grant_type=authorization_code&response_type=code&redirect_uri=" + REDIRECT_URI;


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

    accessToken = JSON.parse(body);
    console.log(accessToken);
    res.redirect('/');
  });

});

// Guest token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Fguest-token
app.get('/guest_token', function(req, res){
  var url = API_URL + '/oauth/accesstoken',
    params = "grant_type=client_credentials",
    contentLength = params.length,
    headers = {
      'Authorization': 'Basic ' + toBase64(APP_KEY + ':' + APP_SECRET),
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
    guestToken = JSON.parse(body);
    console.log(guestToken);
    res.redirect('/');
  });


});

// Refresh token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token-refresh
app.get('/refresh_token', function(req, res) {

  if (accessToken){  
    var url = API_URL + '/oauth/refreshtoken',
      params = "grant_type=refresh_token&refresh_token=" + accessToken.refresh_token,
      contentLength = params.length,
      headers = {
        'Authorization': 'Basic ' + toBase64(APP_KEY + ':' + APP_SECRET),
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

      accessToken = JSON.parse(body);
      console.log(accessToken);
      res.redirect('/');
    });
  }else{
    res.redirect('/');
  }

});

//logout endpoint
app.get('/logout', function(req, res){
  accessToken = null;
  guestToken = null;
  res.redirect('/');
});


app.listen(3000);

console.log('Express server started on port 3000');
