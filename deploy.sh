#!/bin/bash

pkill node
git pull

sudo cp -R src/client/webapp/* /var/www/html

sudo cp -R src/server/* ~/web-server/
sudo chown -R ec2-user ~/web-server/

cd ~/web-server/

node Server.js &
