var express = require('express');
var app = express();
var fs = require('file-system'), json;
var _ = require('underscore');
const exec = require('child_process').exec;

var oData = "";

const model = 'models/worlds.json';
const minecraftRoot = '/home/ec2-user/minecraft/'

var statuses = {
  running: "1",
  starting: "2",
  stopping: "8",
  stopped: "9"
};

var _getData = function() {
  return JSON.parse(fs.readFileSync(model));
};

var _getWorldById = function(sId) {
  if (!oData) {
    oData = _getData();
  }

  return _.find(oData.Worlds, function(world) {
    return world.id === sId
  });
};

var _renameWorld = function(world, name) {
  var path = minecraftRoot + world.dir + '/server.properties';
  var serverFile = fs.readFileSync(path, 'UTF-8');
  serverFile = serverFile.replace(/^motd=.*/gm, 'motd=' + name );
  fs.writeFileSync(path, serverFile);
};

var _setStatus = function(world, state) {
  world.stateCode = statuses[state];
  world.state = state.charAt(0).toUpperCase() + state.substr(1).toLowerCase();

  console.log("setting world " + world.id + " to " + state);
};

var _setData = function() {
  if (oData) {
    fs.writeFileSync(model, JSON.stringify(oData));
  }
};

app.use(express.logger('dev'));
app.use(express.json());

app.post('/minecraftserver/create', function(req, res) {
  res.status(400);

  var sName = req.body.name;

  if (!sName) {
    res.send("Name is mandatory");
    return;
  }

  // Determine the next Id
  oData = _getData();

  var sId = 0;
  _.each(oData.Worlds, function(world) {
    if (sId < world.id) {
      sId = world.id;
    }
  });
  sId += 1;

  var sDir = "world_" + sId;

  // Execute the creation script
  exec(minecraftRoot + "scripts/create.sh " + sDir,
    {
      shell: "/bin/bash"
    }, function(error, stdout, stderr) {


  });

  // Create the new world
  var oWorld = {};
  oWorld.id = sId;
  oWorld.name = sName;
  oWorld.createdDate = new Date();
  _setStatus(oWorld, "stopped");
  oWorld.dir = sDir;
  oData.Worlds.push(oWorld);

  // Set the name on the server
  _renameWorld(oWorld, sName);

  _setData();

  res.status(200);
  res.send(oWorld);

});

app.post('/minecraftserver/:id/rename', function(req, res) {

  var sId = req.params.id;
  var sName = req.body.name;

  res.status(400);

  if (!sName) {
    res.send("name is mandatory");
    return;
  }

  if (!sId) {
    res.send("id is mandatory");
    return;
  }

  var oWorld = _getWorldById(sId);

  if (oWorld) {

    _renameWorld(oWorld, sName);

    oWorld.name = sName;
    _setData();
    res.status(200);
    res.send(oWorld);
  } else {
    res.send("World not found!");
  }
});


app.post('/minecraftserver/:id/start', function(req, res) {
  res.status(400);

  var sId = req.params.id;
  var oWorld = _getWorldById(sId);

  console.log("start " + sId);

  if (!oWorld) {
    res.send("World not found");
  }

  /* Look for any started worlds */
  var aStarted = _.filter(oData.Worlds, function(world) {
    return world.stateCode === statuses.running;
  });
  console.log(aStarted);

  /* If we found any, stop them */
  if (aStarted) {
    _.each(aStarted, function(world) {
      _setStatus(world, "stopping");
    });
  }

  _setData();

  res.status(200).send(oWorld);
});

app.get('/minecraftserver', function(req, res) {
  var data = JSON.parse(fs.readFileSync(model));
  res.send(data);
});

app.listen(4123);
console.log('listening on port 4123');
