# spark-auth-sample-javascript

This is a sample code for using spark authentication js sdk.

## Create application on Spark developer portal

Sign up to [Spark developer portal](https://spark.autodesk.com/developers/) and create a new application [here](https://spark.autodesk.com/developers/getStarted).

Set you Callback URL to be the path to where you browse index.html.

## Installation

Install nodejs and run in server/nodejs directory.

```sh

 node server.js

``` 

Make sure the port is the same port written in server.js

## Configuration

Copy assets/scripts/config.example.js file to a new file named config.js and:

 1. Initialize APP_KEY with your App Key.

 2. Initialize REDIRECT_URI with your Callback URL.

Copy server/nodejs/config.example.js file to a new file named config.js and:

 1. Initialize APP_KEY with your App Key.

 2. Initialize APP_SECRET with your App Secret.

## Usage

To start using this sample you just have to browse index.html
