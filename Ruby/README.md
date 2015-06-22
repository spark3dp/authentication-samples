# spark-auth-sample-ruby

This is a sample code for using spark authentication api.

## Create application on Spark developer portal

Sign up to [Spark developer portal](https://spark.autodesk.com/developers/) and create a new application [here](https://spark.autodesk.com/developers/getStarted).

Set you Callback URL to be your server's path (i.e. http://your-server:4567/)

## Configuration

Open the config.rb file:

 1. Set your APP_KEY with your App Key.

 2. Set your APP_SECRET with your App Secret.

## To run the server
* [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/) and [Ruby gems](https://rubygems.org/pages/download)
* Install sinatra and erubis gems:
```sh
$ gem install sinatra
$ gem install erubis
```
* Run inside the Ruby directory:
```sh
$ ruby app.rb
```

## Usage

To start using this sample you just have to browse to http://your-server:4567/


