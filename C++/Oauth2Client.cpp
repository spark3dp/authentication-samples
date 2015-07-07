/***
* =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
*
* Oauth2Client.cpp : Defines the entry point for the console application
*
* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

/*

INSTRUCTIONS

This sample performs authorization code grant flow with OAuth 2.0.

This sample is for Windows Desktop, OS X and Linux.

Set the app key & app secret strings below (i.e. s_spark_key, s_spark_secret)
To get key & secret, register an app in the spark developer portal: https://spark.autodesk.com/developers.


*/
#include "stdafx.h"
#include <mutex>

#if defined(_WIN32) && !defined(__cplusplus_winrt)
// Extra includes for Windows desktop.
#include <windows.h>
#include <Shellapi.h>
#endif

#include "cpprest/http_listener.h"
#include "cpprest/http_client.h"

using namespace utility;
using namespace web;
using namespace web::http;
using namespace web::http::client;
using namespace web::http::oauth2::experimental;
using namespace web::http::experimental::listener;

//
// Set key & secret pair to enable access to spark APIs.
//
static const utility::string_t s_spark_key(U("APP_KEY"));
static const utility::string_t s_spark_secret(U("APP_SECRET"));

//
// Utility method to open browser on Windows, OS X and Linux systems.
//
static void open_browser(utility::string_t auth_uri)
{
#if defined(_WIN32) && !defined(__cplusplus_winrt)
    // NOTE: Windows desktop only.
    auto r = ShellExecuteA(NULL, "open", conversions::utf16_to_utf8(auth_uri).c_str(), NULL, NULL, SW_SHOWNORMAL);
#elif defined(__APPLE__)
    // NOTE: OS X only.
    string_t browser_cmd(U("open \"") + auth_uri + U("\""));
    system(browser_cmd.c_str());
#else
    // NOTE: Linux/X11 only.
    string_t browser_cmd(U("xdg-open \"") + auth_uri + U("\""));
    system(browser_cmd.c_str());
#endif
}

//
// A simple listener class to capture OAuth 2.0 HTTP redirect to localhost.
// The listener captures redirected URI and obtains the token.
// This type of listener can be implemented in the back-end to capture and store tokens.
//
class oauth2_code_listener
{
public:
    oauth2_code_listener(
        uri listen_uri,
        oauth2_config& config) :
            m_listener(new http_listener(listen_uri)),
            m_config(config)
    {
        m_listener->support([this](http::http_request request) -> void
        {
            if (request.request_uri().path() == U("/") && request.request_uri().query() != U(""))
            {
                m_resplock.lock();

                m_config.token_from_redirected_uri(request.request_uri()).then([this,request](pplx::task<void> token_task) -> void
                {
                    try
                    {
                        token_task.wait();
                        m_tce.set(true);
                    }
                    catch (const oauth2_exception& e)
                    {
                        ucout << "Error: " << e.what() << std::endl;
                        m_tce.set(false);
                    }
                });

                request.reply(status_codes::OK, U("Ok."));

                m_resplock.unlock();
            }
            else
            {
                request.reply(status_codes::NotFound, U("Not found."));
            }
        });

        m_listener->open().wait();
    }

    ~oauth2_code_listener()
    {
        m_listener->close().wait();
    }

    pplx::task<bool> listen_for_code()
    {
        return pplx::create_task(m_tce);
    }

private:
    std::unique_ptr<http_listener> m_listener;
    pplx::task_completion_event<bool> m_tce;
    oauth2_config& m_config;
    std::mutex m_resplock;
};

//
// Base class for OAuth 2.0 sessions of this sample.
//
class oauth2_session_sample
{
public:
    oauth2_session_sample(utility::string_t name,
        utility::string_t client_key,
        utility::string_t client_secret,
        utility::string_t auth_endpoint,
        utility::string_t token_endpoint,
        utility::string_t redirect_uri) :
            m_oauth2_config(client_key,
                client_secret,
                auth_endpoint,
                token_endpoint,
                redirect_uri),
            m_name(name),
            m_listener(new oauth2_code_listener(redirect_uri, m_oauth2_config))
    {}

    void run()
    {
        if (is_enabled())
        {
            ucout << "Running " << m_name.c_str() << " session..." << std::endl;

            if (!m_oauth2_config.token().is_valid_access_token())
            {
                if (authorization_code_flow().get())
                {
                    m_http_config.set_oauth2(m_oauth2_config);
                }
                else
                {
                    ucout << "Authorization failed for " << m_name.c_str() << "." << std::endl;
                }
            }

            run_internal();
        }
        else
        {
            ucout << "Skipped " << m_name.c_str() << " session sample because app key or secret is empty. Please see instructions." << std::endl;
        }
    }

protected:
    virtual void run_internal() = 0;

    pplx::task<bool> authorization_code_flow()
    {
        open_browser_auth();
        return m_listener->listen_for_code();
    }

    http_client_config m_http_config;
    oauth2_config m_oauth2_config;

private:
    bool is_enabled() const
    {
        return !m_oauth2_config.client_key().empty() && !m_oauth2_config.client_secret().empty();
    }

    void open_browser_auth()
    {
        auto auth_uri(m_oauth2_config.build_authorization_uri(true));
        ucout << "Opening browser in URI:" << std::endl;
        ucout << auth_uri << std::endl;
        open_browser(auth_uri);
    }

    utility::string_t m_name;
    std::unique_ptr<oauth2_code_listener> m_listener;
};

//
// Specialized class for Spark OAuth 2.0 session.
//
class spark_session_sample : public oauth2_session_sample
{
public:
	spark_session_sample() :
		oauth2_session_sample(U("Spark"),
			s_spark_key,
			s_spark_secret,
			U("https://sandbox.spark.autodesk.com/api/v1/oauth/authorize"),
			U("https://sandbox.spark.autodesk.com/api/v1/oauth/accesstoken"),
			U("http://localhost:8889/"))
	{
		// Spark uses "default" OAuth 2.0 settings.
	}

protected:
	void run_internal() override
	{
		http_client api(U("https://sandbox.spark.autodesk.com/api/v1"), m_http_config);
	}
};


#ifdef _WIN32
int wmain(int argc, wchar_t *argv[])
#else
int main(int argc, char *argv[])
#endif
{
    ucout << "Running OAuth 2.0 client sample..." << std::endl;

	 spark_session_sample spark;
	 spark.run();

    ucout << "Done." << std::endl;
    return 0;
}
