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

namespace {
	const string CRLF = "\r\n";
	const string BOUNDARY = "xxxtXGddonlfOoyaEOLpXFia8LqV10PqzCTVJ8Fh5igxxx";
	const string FILENAME_MARK = "<<<FILENAME>>>";

	const string PREFIX = CRLF + "--" + BOUNDARY + CRLF + "Content-Disposition: form-data;"
		+ " name=\"file\"; filename=\"" + FILENAME_MARK + "\"" + CRLF + "Content-Type: octet/stream" + CRLF + CRLF;

	const string SUFFIX = CRLF + CRLF + "--" + BOUNDARY
		+ CRLF + "Content-Disposition: form-data; name=\"unzip\"" + CRLF + CRLF + "false" + CRLF + "--" + BOUNDARY
		+ CRLF + "Content-Disposition: form-data; name=\"public\"" + CRLF + CRLF + "true" + CRLF + "--" + BOUNDARY
		+ "--" + CRLF;
};

void upload_file(const string_t& access_token, const string_t& path)
{
	ucerr << "Using file: " << path << endl;
	ucerr << "Using token: Bearer " << access_token << endl;

	// Manually build up an HTTP request with header and request URI.
	uri_builder builder;
	builder
		.set_scheme(U("https"))
		.set_host(U("sandbox.spark.autodesk.com"));

	http_request request(methods::POST);
	request.set_request_uri(U("api/v1/files/upload"));

	//Setting access token
	request.headers().add(U("Authorization"), U("Bearer ") + access_token);
	request.headers().set_content_type(utility::conversions::to_string_t("multipart/form-data; boundary=" + BOUNDARY));

	//Parsing filename
	auto string_path = utility::conversions::to_utf8string(path);
	string basename = string_path.substr(string_path.find_last_of("/\\") + 1);
    
	ifstream inputFile(path, ios::binary);
	string modifiedPrefix = PREFIX;

	//Setting the actual filename
	modifiedPrefix.replace(modifiedPrefix.find(FILENAME_MARK), FILENAME_MARK.size(), basename);

	vector<unsigned char> body;
	copy(modifiedPrefix.begin(), modifiedPrefix.end(), back_inserter(body));
	copy(istreambuf_iterator<char>(inputFile), istreambuf_iterator<char>(), back_inserter(body));
	copy(SUFFIX.begin(), SUFFIX.end(), back_inserter(body));

	request.set_body(body);

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
	if (argc < 3) {
		cerr << "Not enough arguments. Usage: " << argv[0] << "<Access-Token> <filename(full file path with file extension)>" << endl;
		exit(1);
	}
	upload_file(argv[1], argv[2]);
	return 0;
}