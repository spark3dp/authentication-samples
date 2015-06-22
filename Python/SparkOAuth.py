import os, sys, time
import urlparse, urllib, webbrowser
import httplib
import oauth2 as oauth
import SimpleHTTPServer
import SocketServer
import BaseHTTPServer
import urlparse
import requests
import base64
import json
from jinja2 import Template
from flask import Flask, render_template, redirect, request, make_response


#TODO: in your app settings(in Developer Portal) you should change your "Callback URL" field to "http://localhost:8089/callback"

#TODO: enter your CLIENT_ID from Developer Portal App page
CONSUMER_KEY ='APP_KEY'

#TODO: enter your CLIENT_SECRET from Developer Portal App page
CONSUMER_SECRET ='APP_SECRET'

PORT = 8089
SPARK_ENDPOINT = "https://sandbox.spark.autodesk.com";
LOGIN_URI = SPARK_ENDPOINT + "/api/v1/oauth/authorize";
TOKEN_URI = SPARK_ENDPOINT + "/api/v1/oauth/accesstoken";
REFRESH_TOKEN_URI = SPARK_ENDPOINT + "/api/v1/oauth/refreshtoken";

ACCESS_TOKEN_KEY = "python_auth_sample_spark_access_token"
REFRESH_TOKEN_KEY = "python_auth_sample_spark_refresh_token"
GUEST_TOKEN_KEY = "python_auth_sample_spark_guest_token"


app = Flask(__name__)

@app.route("/")
def index():
	resp = make_response(render_template('spark-template.html', accessToken=request.cookies.get(ACCESS_TOKEN_KEY), refreshToken=request.cookies.get(REFRESH_TOKEN_KEY),guestToken=request.cookies.get(GUEST_TOKEN_KEY)))
	return resp

@app.route("/signin")
def signIn():
	print "in SIGN IN"
	loginUrl= ("%s?client_id=%s&response_type=code" % (LOGIN_URI,CONSUMER_KEY))

	resp = redirect(loginUrl, code=302)
	return resp

@app.route("/callback")
def callback():
	code = request.args.get('code')
	print request

	print "got code: %s" % code

	encodedAuthorizationHeader = base64.b64encode(bytes(CONSUMER_KEY+":"+CONSUMER_SECRET))
	payload = 'code=%s&response_type=code&grant_type=authorization_code' % code
	headers = {'Authorization': 'Basic '+encodedAuthorizationHeader, 'Content-type':'application/x-www-form-urlencoded'}
	res = requests.post(TOKEN_URI,data=payload,headers=headers)
			
	print "response:" + res.text

	accessToken = json.loads(res.text)['access_token']
	refreshToken = json.loads(res.text)['refresh_token']

	resp = redirect("/", code=302)
	resp.set_cookie(ACCESS_TOKEN_KEY, accessToken)
	resp.set_cookie(REFRESH_TOKEN_KEY, refreshToken)

	return resp


@app.route("/logout")
def logout():
	resp = redirect("/", code=302)
	resp.set_cookie(REFRESH_TOKEN_KEY,  "",expires=-90)
	resp.set_cookie(ACCESS_TOKEN_KEY, "",expires=-90)
	return resp


@app.route("/guest")
def getGuestToken():
	encodedAuthorizationHeader = base64.b64encode(bytes(CONSUMER_KEY+":"+CONSUMER_SECRET))
	payload = 'grant_type=client_credentials'
	headers = {'Authorization': 'Basic '+encodedAuthorizationHeader, 'Content-type':'application/x-www-form-urlencoded'}
	res = requests.post(TOKEN_URI,data=payload,headers=headers)
			
	print "response:" + res.text

	token = json.loads(res.text)['access_token']
	resp = redirect("/", code=302)
	resp.set_cookie(GUEST_TOKEN_KEY, token)

	return resp


@app.route("/refresh")
def refreshToken():
	encodedAuthorizationHeader = base64.b64encode(bytes(CONSUMER_KEY+":"+CONSUMER_SECRET))
	payload = 'grant_type=refresh_token&refresh_token=%s' % request.cookies.get(REFRESH_TOKEN_KEY)
	headers = {'Authorization': 'Basic '+encodedAuthorizationHeader, 'Content-type':'application/x-www-form-urlencoded'}
	res = requests.post(REFRESH_TOKEN_URI,data=payload,headers=headers)
			
	print "response:" + res.text

	accessToken = json.loads(res.text)['access_token']
	refreshToken = json.loads(res.text)['refresh_token']
	
	resp = redirect("/", code=302)
	resp.set_cookie(ACCESS_TOKEN_KEY, accessToken)
	resp.set_cookie(REFRESH_TOKEN_KEY, refreshToken)

	return resp


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)


