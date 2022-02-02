#!/bin/bash

cd sizer/webapps
echo "Installing node modules(Ignoring if present)"
npm install
echo "Building dist"
ng build --prod
echo "removing node modules"
rm -rf node_modules
cd -
