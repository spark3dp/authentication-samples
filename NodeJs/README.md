# spark-auth-sample-node

This code sample demonstrates use of the Spark authentication API.

## Create an application on the Spark developers portal

Sign up to the [Spark developer portal](https://spark.autodesk.com/developers/) and create a new application [here](https://spark.autodesk.com/developers/getStarted).

In the app setting's API Keys tab, set the Callback URL to be your server's path (i.e. http://your-server:3000/)

## Configuration

Open the config.js file:

 1. Set APP_KEY to your App Key.

 2. Set APP_SECRET with your App Secret.

## To run the server
* [Install nodejs and npm](https://docs.npmjs.com/getting-started/installing-node)
* Run inside the Nodejs directory:
```sh
$ npm install
$ node server.js
```

## Usage

To run this sample, browse to http://your-server:3000/
