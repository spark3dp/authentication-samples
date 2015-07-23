# spark-auth-sample-python

This sample code demonstrates use of the Spark authentication API.

## Create an application on the Spark developers' portal

Sign up to the [Spark developers' portal](https://spark.autodesk.com/developers/) and create a new application [here](https://spark.autodesk.com/developers/getStarted).

In the app setting's API Keys tab, set the Callback URL to http://localhost:8089/callback.

## Configuration

Open the SparkOAuth.py file:

 1. Set the CONSUMER_KEY to your App Key.

 2. Set the CONSUMER_SECRET to your App Secret.

## Usage

To run this sample:

 1. Open a terminal and "cd" to the directory

 2. Run "sudo pip install -r requirements.txt". (if you don't have "pip" - please install it by running "sudo easy_install pip")

 3. Run "python SparkOAuth.py".

 4. In your favorite browser, open http://localhost:8089
