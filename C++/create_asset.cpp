#include "cpprest/http_client.h"
#include <iterator>
#include <fstream>
#include <iostream>
#include <string>
#include "stdlib.h"

using std::cerr;
using std::copy;
using std::endl;
using std::ifstream;
using std::ios;
using std::istreambuf_iterator;
using std::string;
using std::vector;
using utility::string_t;
using web::http::client::http_client;
using web::http::http_request;
using web::http::http_response;
using web::http::methods;
using web::http::uri_builder;

void create_asset(const string_t& access_token, const string_t& asset_name, const string_t& description, const string_t& tags)
{
    ucerr << "Using token: Bearer "<< access_token << endl;

    // Manually build up an HTTP request with header and request URI.
    uri_builder builder;
    builder
        .set_scheme(U("https"))
        .set_host(U("sandbox.spark.autodesk.com"));

    http_request request(methods::POST);
    request.set_request_uri(U("api/v1/assets"));

    //Setting access token
    request.headers().add(U("Authorization"), U("Bearer ") + access_token);

    uri_builder argsUriBuilder;
    argsUriBuilder
        .append_query(U("asset_name"), asset_name)
        .append_query(U("description"), description)
        .append_query(U("tags"), tags);
    ucerr << "Using args: " << argsUriBuilder.query() << endl;
    request.set_body(argsUriBuilder.query(), U("application/x-www-form-urlencoded"));

    // Create http_client to send the request.
    http_client client(builder.to_uri());

    // This example uses the task::wait method to ensure that async operations complete before the app exits.  
    // In most apps, you typically don't wait for async operations to complete.
    client.request(request).then([=](http_response response) {
            ucerr << "Response:\n" << response.to_string() << endl;
            }).wait();
}

#ifdef _WIN32
int wmain(int argc, wchar_t *argv[])
#else
int main(int argc, char *argv[])
#endif
{
    if(argc < 5) {
        cerr << "Not enough arguments. Usage: " << argv[0] << " <Access-Token> <asset_name> <description> <tags>" << endl;
        exit(1);
    }
    create_asset(argv[1], argv[2], argv[3], argv[4]);
    return 0;
}

