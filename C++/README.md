# spark-auth-sample-cpp

This C++ sample code demonstrates how to use the following Spark APIs:
* Generate an access token
* Upload files to the Spark drive
* Create an asset
* Add souce files to an asset

Note that to run this sample code, you need to be able to open an internet browser and enter your Spark login details.

Follow the instructions below for Windows (link) or Mac (link).

## Instructions for Mac

### Installation

1. Download and install <a href="https://github.com/Microsoft/cpprestsdk/wiki" target="_blank">C++ REST SDK</a>.
<br>(Additional installation for **Linux** and **MAC OS X**) From the terminal, navigate to the *casablanca/build.release* folder (if you do not have this folder, navigate to the *casablanca/build.debug* folder). Install *libcpprest* by running `make install`.
2. Download the *authentication-samples* repository.

### Create an app on the Spark Developer portal

1. Sign up to the <a href="https://spark.autodesk.com/developers/" target="_blank">Spark Developers portal</a> and <a href="https://spark.autodesk.com/developers/reference/software-developers/tutorials/register-an-app" target="_blank">create a new app</a>. The App Details page opens displaying details about the app. Note the app key and the app secret.
2. In the App Details page, set the callback URL to be the URL of the page you want the authorization code to be sent to. This sample uses 'http://<i></i>localhost:8889/'. If you want to use a different callback URL, update the code from the           
  *Oauth2Client.cpp* file found in the downloaded repository folder:<br>
`static const utility::string_t s_spark_callbackurl(U("http://localhost:8889/"));`

### Configuration

Open the *Oauth2Client.cpp* file found in the downloaded repository folder, and replace `APP_KEY` and `APP_SECRET` with the app key and app secret generated when the app was created. For more information about authentication, see the <a href="https://spark.autodesk.com/developers/reference/api/authentication" target="_blank">Authentication API documentation</a>.

### Build

1. From the terminal, navigate to the *authenitcation-samples>C++* folder.

2. Run `./build.sh`

### Run the authentication API sample code

1. Run `./bin/Oauth2Client`

   A browser window opens displaying the Spark login screen.

2. Login with your username and password. A message appears informing you that your access token has been sent to the terminal.

3. Make a note of the access token, which you need to run other APIs.

### Run the upload file API sample code

Run `./bin/upload_file <access_token> <file_to_upload>`
<br>Note that you must include a file extension.

Example call:

`./bin/upload_file fWgAHwvfH8Tv8oufFTMruk1qAoSh "/admin/Downloads/report.jpg"`

Example response:
```json
{
  "files": [
    {
      "name": "README.md",
      "md5sum": "6dd6539899b42d9fb9737a76c8fdb889",
      "file_id": 18112641,
      "public_url": "http://static.spark.autodesk.com/Public/Beta/report.jpg"
    }
  ]
}
```

### Run the create asset API sample code
Assets are objects that contain all the files and data related to a 3D model. For more information, see <a href="https://spark.autodesk.com/developers/reference/drive?deeplink=/reference/assets" target="_blank">Asset API documentation</a>

Run `./bin/create_asset <access_token> <asset_name_for_new_asset> <description_of_asset> <asset_tags>`

Example response:

```json
{
  "_link": "/assets/1561124",
  "asset_id": 1561124
}
```

### Run the add source files to an asset API sample code

When an uploaded file is added to an asset it is called a source file. For more details about source files, see <a href="https://spark.autodesk.com/developers/reference/drive?deeplink=/reference/assets/asset-sources" target="_blank">Source file API documentation</a>.<br>
Run `./bin/create_source_within_asset <access_token> <asset_id_of_created_asset> <file_id_of_uploaded_file>`

Example response:

```json
{
  "_link": "/assets/1584655/sources"
}
```

##Instructions for Windows

### Installation

1. Download the *authentication-samples* repository.
2. Navigate to the *authentication-samples>c++>Windows* folder and double-click *cpp-sample.app.sln*. Visual Studio is launched.
3. In the right-hand pane in Visual Studio, right-click *Solution cpp-sample.app* and select **Manage NuGet Packages for Solution**. The **Manage Packages for Solution** window opens.
4. Search for *cpprestsdk*, select *cpprestsdk.v140.Windesktop.msvcstl.dyn.rt-dyn*, and choose all the repository projects.
5. Select the **Install button**. The **Preview** window opens. Select OK. A **Successfully installed** message is displayed.

### Create an app on the Spark Developer portal

1. Sign up to the <a href="https://spark.autodesk.com/developers/" target="_blank">Spark Developers portal</a> and <a href="https://spark.autodesk.com/developers/reference/software-developers/tutorials/register-an-app" target="_blank">create a new app</a>. The App Details page opens displaying details about the app. Note the app key and the app secret.
2. In the App Details page, set the callback URL to be the URL of the page you want the authorization code to be sent to. This sample uses 'http://<i></i>localhost:8889/'. If you want to use a different callback URL, update the code from the           
  *Oauth2Client.cpp* file found in the downloaded repository folder:<br>
`static const utility::string_t s_spark_callbackurl(U("http://localhost:8889/"));`

### Configuration

Open the *Oauth2Client.cpp* file found in the the *OAuth2Client* project, and replace `APP_KEY` and `APP_SECRET` with the app key and app secret generated when the app was created. For more information about authentication, see the <a href="https://spark.autodesk.com/developers/reference/api/authentication" target="_blank">Authentication API documentation</a>.

### Run the authentication API sample code

1.	Run the *OAuth2Client* project (Ctrl + F5). A browser window opens displaying the Spark login screen.
2.	Log in with your username and password. A message appears informing you that your access token has been sent to the terminal.
3.	Make a note of the access token, which you need to run other APIs. Make a note of the access token, which you need to run other APIs.

### Run the upload file API sample code

Run the *uploadFile* project with the following parameters: `<access_token> <file_to_upload>`.
Note that you must include a file extension.

Example response:
```json
{
  "files": [
    {
      "name": "README.md",
      "md5sum": "6dd6539899b42d9fb9737a76c8fdb889",
      "file_id": 18112641,
      "public_url": "http://static.spark.autodesk.com/Public/Beta/report.jpg"
    }
  ]
}
```
### Run the create asset API sample code
Assets are objects that contain all the files and data related to a 3D model. For more information, see <a href="https://spark.autodesk.com/developers/reference/drive?deeplink=/reference/assets" target="_blank">Asset API documentation</a>

Run the *createAsset* project with the following parameters: <access_token> <asset_name_for_new_asset> <description_of_asset> <asset_tags>.

Example response:

```json
{
  "_link": "/assets/1561124",
  "asset_id": 1561124
}
```

### Run the add source files to an asset API sample code

When an uploaded file is added to an asset it is called a source file. For more details about source files, see <a href="https://spark.autodesk.com/developers/reference/drive?deeplink=/reference/assets/asset-sources" target="_blank">Source file API documentation</a>.<br>

Run the *createSource* project with the following parameters: <access_token> <asset_id_of_created_asset> <file_id_of_uploaded_file>

Example response:

```json
{
  "_link": "/assets/1584655/sources"
}
```


