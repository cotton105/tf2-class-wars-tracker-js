#!/bin/sh

APP_ROOT=$(cd $(dirname "${BASH_SOURCE[0]}") && pwd)/..
cd $APP_ROOT
node $APP_ROOT/start.js
