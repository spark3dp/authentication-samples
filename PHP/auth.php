<?php

include('config.php');

error_reporting(E_ERROR);


function getRedirectUrl(){
    $protocol = isset($_SERVER['HTTPS']) ? 'https://' : 'http://';
    return $protocol . $_SERVER['HTTP_HOST'] . strtok($_SERVER["REQUEST_URI"],'?');
}

function redirectToSpark(){
    $redirectUrl =  API_URL . '/oauth/authorize?response_type=code&client_id=' . APP_ID . '&redirect_uri=' . getRedirectUrl();
    header('location:' . $redirectUrl);
}

function logout(){

    setcookie('php_auth_sample_spark_access_token', null);

    setcookie('php_auth_sample_spark_refresh_token',null);

    setcookie('php_auth_sample_spark_refresh_token_expires_at', null);

    header('location:' . getRedirectUrl());
}

function refreshAccessToken(){

    $refreshTokenUrl = API_URL . '/oauth/refreshtoken';

    // Get cURL resource
    $curl = curl_init();

    $data = array(
        refresh_token => $_COOKIE['php_auth_sample_spark_refresh_token'],
        grant_type => 'refresh_token');

    curl_setopt($curl, CURLOPT_URL, $refreshTokenUrl);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl, CURLOPT_HEADER, FALSE);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        "Content-Type: application/x-www-form-urlencoded",
        "Authorization: Basic " . base64_encode(APP_ID . ":" . APP_SECRET)
    ));

    //Don't use this in production!
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

    // Send the request & save response to $resp
    $resp = curl_exec($curl);

    // Close request to clear up some resources
    curl_close($curl);

    $json_res = json_decode($resp, true);

    setcookie('php_auth_sample_spark_access_token', $json_res['access_token']);

    setcookie('php_auth_sample_spark_refresh_token', $json_res['refresh_token']);

    setcookie('php_auth_sample_spark_refresh_token_expires_at', $json_res['expires_at']);

    header('location:' . getRedirectUrl());

    exit;
}

function getGuestToken(){

    $guestTokenUrl = API_URL . '/oauth/accesstoken';

    // Get cURL resource
    $curl = curl_init();

    $data = array(grant_type => 'client_credentials');

    curl_setopt($curl, CURLOPT_URL, $guestTokenUrl);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl, CURLOPT_HEADER, FALSE);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        "Content-Type: application/x-www-form-urlencoded",
        "Authorization: Basic " . base64_encode(APP_ID . ":" . APP_SECRET)
    ));

    //Don't use this in production!
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

    // Send the request & save response to $resp
    $resp = curl_exec($curl);

    // Close request to clear up some resources
    curl_close($curl);

    $json_res = json_decode($resp, true);

    setcookie('php_auth_sample_spark_guest_token', $json_res['access_token']);

    header('location:' . getRedirectUrl());

    exit;
}

function getAccessToken($code)
{
    $accessTokenUrl = API_URL . '/oauth/accesstoken';

    // Get cURL resource
    $curl = curl_init();

    $data = array(
    redirect_uri => getRedirectUrl(),
    code => $code,
    grant_type => 'authorization_code',
    response_type => 'code');

    curl_setopt($curl, CURLOPT_URL, $accessTokenUrl);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($curl, CURLOPT_HEADER, FALSE);
    curl_setopt($curl, CURLOPT_POST, TRUE);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        "Content-Type: application/x-www-form-urlencoded",
        "Authorization: Basic " . base64_encode(APP_ID . ":" . APP_SECRET)
    ));

    //Don't use this in production!
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);


    // Send the request & save response to $resp
    $resp = curl_exec($curl);

    // Close request to clear up some resources
    curl_close($curl);

    $json_res = json_decode($resp, true);

    setcookie('php_auth_sample_spark_access_token', $json_res['access_token']);

    setcookie('php_auth_sample_spark_refresh_token', $json_res['refresh_token']);

    setcookie('php_auth_sample_spark_refresh_token_expires_at', $json_res['expires_at']);

    header('location:' . getRedirectUrl());

    exit;
}

if ($_GET['login']){
	redirectToSpark();
}
else if ($_GET['logout']){
    logout();
}
else if ($_GET['logout']){
    logout();
}
else if ($_GET['refresh_token']){
    refreshAccessToken();
}
else if ($_GET['guest_token']){
    getGuestToken();
}
else if (isset($_GET['code']))
{
    getAccessToken($_GET['code']);
      //put token in cookie
}

?>

<!DOCTYPE html>
<html lang="en">
<header>
    <title>Spark Sample Application - Authentication</title>
    <meta charset="utf-8">
    <!-- fonts -->
    <link href='//fonts.googleapis.com/css?family=Open+Sans:300,600,400' rel='stylesheet' type='text/css'>
    <!-- Bootstrap core CSS -->
    <link href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet" type="text/css" />
</header>
<body>
    <div class="container">
        <div class="col-md-12">
            <div id="welcome-wrapper">
                <h2>Welcome to <br/>Spark PHP Authentication Sample App</h2>

                <p>To try the sample, you need to login with a test environment account.</p>

                <div class="col-md-12">
                    <p class="token-wrapper">Guest Token:
                        <b id="guest-token-span">
                        <?php if ($_COOKIE['php_auth_sample_spark_guest_token']){ print_r($_COOKIE['php_auth_sample_spark_guest_token']); } else { print_r('none'); } ?>
                        </b>
                    </p>

                    <p class="token-wrapper" id="access-token">
                        Access Token:
                        <b id="access-token-span">
                        <?php if ($_COOKIE['php_auth_sample_spark_access_token']){ print_r($_COOKIE['php_auth_sample_spark_access_token']); } else { print_r('none'); } ?>
                        </b>
                    </p>

                    <p class="token-wrapper">Refresh Token:
                        <b id="refresh-token-span">
                        <?php if ($_COOKIE['php_auth_sample_spark_refresh_token']){ print_r($_COOKIE['php_auth_sample_spark_refresh_token']); } else { print_r('none'); } ?>
                        </b>
                    </p>

                    <?php if (!$_COOKIE['php_auth_sample_spark_access_token']){?>
                        <a id="login" class="spark_btn primary" href="?login=true">Login to Get an Access Token</a>
                    <?php }else{ ?>
                        <a id="logout" href="?logout=true" class="spark_btn primary">Logout</a>
                    <?php } ?>
                    <?php if ($_COOKIE['php_auth_sample_spark_access_token']){?>
                        <a id="refresh_token" href="?refresh_token=true" class="spark_btn">Refresh access token</a>
                    <?php } ?>
                    <a class="spark_btn" href="?guest_token=true">Get Guest Token</a>
                </div>

            </div>
        </div>

    </div>
</body>
</html>