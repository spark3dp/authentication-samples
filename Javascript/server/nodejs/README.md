Spark NodeJS server
===================
This server implements Spark OAuth2.0 required endpoints:

* Access token callback endpoint - `/access_token`
* Guest token callback endpoint - `/guest_token`
* Refresh token callback endpoint - `/refresh_token`


All endpoints are accessible through `http://your-server-url:3000/the_endpoint` where `the_endpoint` is one of the end points above

###To run the server
* Copy config.example.js to config.js and set your App Key and App Secret
* [Install nodejs and npm](https://docs.npmjs.com/getting-started/installing-node)
* Run:
```sh
$ npm install
$ node server.js
```

Now you have a server running on your machine with the access, guest and refresh token endpoints