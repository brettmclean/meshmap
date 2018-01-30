jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;

var loader = require("./loader");

global.meshmap = loader.load("index");
global.meshmap.models = loader.load("model/datamodel");

require("./testDependencies");
