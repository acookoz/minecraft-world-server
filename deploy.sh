#!/bin/bash

pkill node

mv ~/web-server/models/worlds.json ~/web-server/models/worlds.json.bak

git pull

sudo cp -R src/client/webapp/* /var/www/html

sudo cp -R src/server/* ~/web-server/
sudo chown -R ec2-user ~/web-server/

cd ~/web-server/

mv models/worlds.json models/worlds.json.example
mv models/worlds.json.bak models/worlds.json

node Server.js >> logs.txt &
