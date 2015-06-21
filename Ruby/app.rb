require 'uri'
require 'net/https'
require 'tilt/erubis'
require 'sinatra'
require 'base64'
require 'json'
enable :sessions

load 'config.rb'

api_url_prefix = (SPARK_ENV === 'production') ? 'api' : 'sandbox'

API_URL = "https://#{api_url_prefix}.spark.autodesk.com/api/v1"

#Show the index page
get '/' do
  guest_token = session[:guest_token] ? session[:guest_token] : nil
  access_token = session[:access_token] ? session[:access_token] : nil
  erb :index,:locals => {:access_token => access_token, :guest_token => guest_token}
end

#Initial page redirecting to Spark Login
get '/auth' do
  redirect authorization_url
end

#Callback service parsing the authorization token and asking for the access token
#See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Faccess-token
get '/callback' do
  resp = curl("#{API_URL}/oauth/accesstoken",{'grant_type' => 'authorization_code',
                                              'response_type' => 'code', 
                                              'code' => params[:code], 
                                              'redirect_uri' => redirect_uri})
  json_resp = JSON.parse(resp.body)
  if json_resp['access_token']
    session[:access_token] = json_resp
  else
    puts("error getting token, response was #{resp.body}")
  end  
  redirect '/'
end

#Guest token service
#See API reference - https://spark.autodesk.com/developers/reference/authentication?deeplink=%2Freference%2Foauth-2.0%2Fguest-token
get '/guest_token' do
  resp = curl("#{API_URL}/oauth/accesstoken",{'grant_type' => 'client_credentials'})
  json_resp = JSON.parse(resp.body)
  if json_resp['access_token']
    session[:guest_token] = json_resp
  else
    puts("error getting token, response was #{resp.body}")
  end  
  redirect '/'
end

get '/refresh_token' do
  if session[:access_token]
    resp = curl("#{API_URL}/oauth/refreshtoken",{'grant_type' => 'refresh_token',
                                                 'refresh_token' => session[:access_token]['refresh_token']})
    json_resp = JSON.parse(resp.body)
    if json_resp['access_token']
      session[:access_token] = json_resp
    else
      puts("error getting token, response was #{resp.body}")
    end  
  end
      
  redirect '/'
end

#logout endpoint
get '/logout' do
  session.delete(:access_token)
  redirect '/'
end

# General POST request to /oauth/accesstoken - used for getting access and guest tokens
def curl(url,params)
  uri = URI.parse(url)
  https = Net::HTTP.new(uri.host,uri.port)
  https.use_ssl = true
  base64h = Base64.strict_encode64("#{APP_KEY}:#{APP_SECRET}")
  headers = {'Authorization' => "Basic #{base64h}", 'Content-Type' =>'application/x-www-form-urlencoded'}
  request = Net::HTTP::Post.new(uri.request_uri, headers)
  request.set_form_data(params)
  response = https.request(request)

end 

def redirect_uri
  uri = URI.parse(request.url)
  uri.path = '/callback'
  uri.query = nil
  uri.to_s
end

def authorization_url
  authorization_uri = URI.parse("#{API_URL}/oauth/authorize")
  authorization_uri.query = "response_type=code&client_id=#{APP_KEY}&redirect_uri=#{redirect_uri}"
  authorization_uri.to_s            
end 
