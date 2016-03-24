cmake_minimum_required(VERSION 3.0)

project(spark-cpp-sdk)
set(EXECUTABLE_OUTPUT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/bin)
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED on)
#set (CMAKE_VERBOSE_MAKEFILE true)

find_package(Boost REQUIRED COMPONENTS system chrono thread)
include_directories(${Boost_INCLUDE_DIRS})
set(LIBS ${LIBS} ${Boost_LIBRARIES} ${Boost_chrono_LIBRARIES} ${Boost_system_LIBRARIES} ${Boost_thread_LIBRARIES})

find_package(openssl REQUIRED)
set(LIBS ${LIBS} ${OPENSSL_LIBRARIES})

find_library(CPPREST_LIBRARIES cpprest)
set(LIBS ${LIBS} ${CPPREST_LIBRARIES})

add_executable(upload_file upload_file.cpp)
target_link_libraries(upload_file ${LIBS})

add_executable(create_asset create_asset.cpp)
target_link_libraries(create_asset ${LIBS})

add_executable(create_source_within_asset create_source_within_asset.cpp)
target_link_libraries(create_source_within_asset ${LIBS})

add_executable(Oauth2Client Oauth2Client.cpp)
target_link_libraries(Oauth2Client ${LIBS})

