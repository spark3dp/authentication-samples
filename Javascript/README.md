# spark-auth-sample-javascript

This is a sample code for using spark authentication js sdk.

## Create application on Spark developer portal

Sign up to [Spark developer portal](https://spark.autodesk.com/developers/) and create a new application [here](https://spark.autodesk.com/developers/getStarted).

Set your Callback URL to be the path to login-callback.html.

Example: http://your_web_server_address:port/login-callback.html.

## Configuration

Copy assets/scripts/config.example.js file to a new file named config.js and:

 1. Initialize APP_KEY with your App Key.

 2. Initialize REDIRECT_URI with your Callback URL.

 3. You can initialize GUEST_TOKEN_URL with http://your_server_address:port/guest_token, or leave it empty and it will point to: http://localhost:3000/guest_token

 4. You can initialize ACCESS_TOKEN_URL with http://your_server_address:port/access_token, or leave it empty and it will point to: http://localhost:3000/access_token

 5. You can initialize REFRESH_TOKEN_URL with http://your_server_address:port/refresh_token, or leave it empty and it will point to: http://localhost:3000/refresh_token

Copy server/nodejs/config.example.js file to a new file named config.js and:

 1. Initialize APP_KEY with your App Key.

 2. Initialize APP_SECRET with your App Secret.

## Installation

* [Install NodejJS and npm](https://docs.npmjs.com/getting-started/installing-node)

* Run inside the NodejJS directory:

```sh
$ npm install
$ node server.js
```

Make sure the port is the same port written in server.js

## Usage

To start using this sample you just have to browse index.html
