#!/bin/bash

git pull

sudo cp -R src/client/webapp/* /var/www/html

sudo cp -R src/server/* ~/web-server/

cd ~/web-server/

node Server.js &
