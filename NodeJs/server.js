var config = require('./config.js');

var APP_KEY = config.APP_KEY,
    APP_SECRET = config.APP_SECRET,
    API_URL = (console.ENV === 'production')  ? 'https://api.spark.autodesk.com/api/v1' 
                                              : 'https://sandbox.spark.autodesk.com/api/v1';


var express = require('express'),
    request = require('request');
    app = express(),
    session = require('express-session');

app.set('views', './views')
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(session({ secret: 'spark secret string', cookie: { maxAge: 7200000 }}))


/*** FUNCTIONS ***/

/**
 * Encode string in base64
 * @param str
 * @returns {*}
 */
var toBase64 = function(str){
  return new Buffer(str).toString('base64');
}


var redirectUri = function(req){
  var fullUrl = req.protocol + '://' + req.get('host');
  return fullUrl + '/callback';  
}

/**
 * Spark Authorization URL endpoint 
 */
var authorizationUrl = function(req){

  return API_URL + '/oauth/authorize' +
                '?response_type=code' +
                '&client_id=' + APP_KEY + 
                '&redirect_uri=' + redirectUri(req);
}

/**
 * General POST request to /oauth/accesstoken - used for getting access and guest tokens
 */
var doRequest = function(url, params,callback){
  var contentLength = params.length,
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
    
    var resp = JSON.parse(body);
    callback(resp);
  });
}



/*** ROUTES ***/

// Show the index page
app.get('/', function (req, res) {
  res.render('index.html',{accessToken:req.session.accessToken,guestToken:req.session.guestToken});
});

// Initial page redirecting to Spark Login
app.get('/auth', function (req, res) {
    res.redirect(authorizationUrl(req));
});

// Callback service parsing the authorization token and asking for the access token
// See API reference - https://spak.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token
app.get('/callback', function (req, res) {
  var code = req.query.code,
      url =  API_URL + '/oauth/accesstoken',
      params = "code=" + code + "&grant_type=authorization_code&response_type=code&redirect_uri=" + redirectUri(req);

  doRequest(url, params, function(token){
    if (token.access_token){
      req.session.accessToken = token;
    }else{
      console.log('error getting token', token);
    }
    res.redirect('/');
  });
});

// Guest token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Fguest-token
app.get('/guest_token', function(req, res){
  var params = "grant_type=client_credentials",
      url =  API_URL + '/oauth/accesstoken';
  doRequest(url, params, function(token){
    if (token.access_token){
      req.session.guestToken = token;
    }else{
      console.log('error getting token', token);
    }
    res.redirect('/');
  });
});

// Refresh token service
// See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token-refresh
app.get('/refresh_token', function(req, res) {

  var accessToken = req.session.accessToken;
  if (accessToken){  
    var params = "grant_type=refresh_token&refresh_token=" + accessToken.refresh_token,
        url =  API_URL + '/oauth/refreshtoken';
    doRequest(url, params, function(token){
      if (token.access_token){
        req.session.accessToken = token;
      }else{
        console.log('error getting token', token);
      }
      res.redirect('/');
    });
  }else{
    res.redirect('/');
  }

});

//logout endpoint
app.get('/logout', function(req, res){
  req.session.accessToken = null;
  res.redirect('/');
});


app.listen(3000);

console.log('Express server started on port 3000');