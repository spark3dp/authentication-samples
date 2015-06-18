# spark-auth-sample-cpp

This is a sample code for using spark authentication api.

## Create application on Spark developer portal

Sign up to [Spark developer portal](https://spark.autodesk.com/developers/) and create a new application [here](https://spark.autodesk.com/developers/getStarted).

Set you Callback URL to be the path to where you browse the sample ( i.e. http://localhost:8889/ ).

## Installation

This sample is using [C++ Rest SDK](https://casablanca.codeplex.com/).

You can install C++ Rest SDK from [here](https://casablanca.codeplex.com/wikipage?title=Using%20NuGet%20to%20add%20the%20C%2b%2b%20REST%20SDK%20to%20a%20VS%20project&referringTitle=Documentation).

After Installation, you can replace Oauth2Client.cpp file with the Oauth2Client.cpp file in this repository.

## Configuration

Open Oauth2Client.cpp file and:

 1. Replace \<YourAppKey\> with your App Key.

 2. Replace \<YourAppSecret\> with your App Secret.

