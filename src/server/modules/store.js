var logger = require("./logger");
var appConfigServiceFactory = require("./config/appConfigServiceFactory");
var path = require("path");

var MEMORY_DATA_STORE = "memory";

var dataStore = null;
var storeName = MEMORY_DATA_STORE;

var appConfig = appConfigServiceFactory.create().getAppConfig();

storeName = appConfig.store.type || storeName;

if(storeName) {
	storeName = storeName.toLowerCase();

	var dataStorePath = "./store/" + storeName + "store.js";
	try {
		dataStore = require(dataStorePath);
	} catch(err) {
		logger.error("Failed to import file at: " + path.join(__dirname, dataStorePath) + ": " + err);
	}
}

if(!dataStore) {
	logger.error("Unable to select data store from configured dataStore property: \"" + storeName + "\"");
	process.exit(1);
}

module.exports = dataStore;
