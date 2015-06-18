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


#TODO: in your app settings(in Developer Portal) you should change your "Callback URL" field to "http://localhost:8089/callback"

#TODO: enter your CLIENT_ID from Developer Portal App page
CONSUMER_KEY ='YOUR_CONSUMER_KEY'

#TODO: enter your CLIENT_SECRET from Developer Portal App page
CONSUMER_SECRET ='YOUR_CONSUMER_SECRET'

PORT = 8089
SPARK_ENDPOINT = "https://sandbox.spark.autodesk.com";
LOGIN_URI = SPARK_ENDPOINT + "/api/v1/oauth/authorize";
TOKEN_URI = SPARK_ENDPOINT + "/api/v1/oauth/accesstoken";


Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):

	def do_HEAD(s):
		s.send_response(200)
		s.send_header("Content-type", "text/html")
 		s.end_headers()

	def do_GET(s):
		if "signin" in s.path:
			print "in SIGN IN"
			#loginUrl=LOGIN_URI+"?client_id="+CONSUMER_KEY+"&response_type=code"
			loginUrl= ("%s?client_id=%s&response_type=code" % (LOGIN_URI,CONSUMER_KEY))
			s.send_response(301)
			s.send_header("Location", loginUrl)
			s.end_headers()

		elif "callback" in s.path:
			print "in CALLBACK"
			parsedParams = urlparse.urlparse(s.path)
			code = urlparse.parse_qs(parsedParams.query)['code'][0]
			print "got code: %s" % code

			encodedAuthorizationHeader = base64.b64encode(bytes(CONSUMER_KEY+":"+CONSUMER_SECRET))
			payload = 'code=%s&response_type=code&grant_type=authorization_code' % code
			headers = {'Authorization': 'Basic '+encodedAuthorizationHeader, 'Content-type':'application/x-www-form-urlencoded'}
			res = requests.post(TOKEN_URI,data=payload,headers=headers)
			
			print "response:" + res.text
			token = json.loads(res.text)['access_token']
			print "token:" + token

			s.send_response(200)
			s.send_header("Content-type", "text/html")
			s.end_headers()

			s.wfile.write("<p>Your token is: %s</p>" % token)
		else:
			"""Respond to a GET request."""
			s.wfile.write("You accessed path: %s. " % s.path)
			s.wfile.write("We have no such route")


httpd = SocketServer.TCPServer(("", PORT), MyHandler)

print "serving at port %s" % PORT
httpd.serve_forever()


