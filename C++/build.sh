#!/usr/bin/env sh
####
# Build script
####

BUILD_DIR=./.build_dir

mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"
# generate makefile using cmake build the library
cmake "$*" .. && make

