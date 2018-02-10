"use strict";

var configLocationManagement = require("./modules/config/configLocationManagement");
var appConfigServiceFactory = require("./modules/config/appConfigServiceFactory");
var fileLogLocationServiceFactory = require("./modules/logging/factories/fileLogLocationServiceFactory");
var version = require("./modules/version");
var busy = require("./modules/busy");
var logger = require("./modules/logger");

logger.info("Starting application" + (version ? " v" + version : "") + ".");
logger.info("Reading config from " + configLocationManagement.getConfigDirectory());

var appConfig = appConfigServiceFactory.create().getAppConfig();

/* Start up logger */
var fileLogLocationService = fileLogLocationServiceFactory.create(appConfig.logging.directory);
var logDirectory = fileLogLocationService.getAbsoluteLogDirectory();
if(logDirectory) {
	logger.info(`Log files will be stored in ${logDirectory}`);
}
logger.init(appConfig);

/* Start up Site Manager */
var sm = require("./modules/sitemanager");
sm.init(appConfig);

/* Start up data store */
var store = require("./modules/store");
store.init(appConfig);

/* Start up server */
var server = require("./modules/server");
server.init();

process.on("SIGINT", function() {
	logger.info("SIGINT received.");
	process.exit();
});

process.on("exit", function() {
	logger.info("Application is shutting down.");
	busy.shutdown(); // Shutdown toobusy event loop polling
	server.shutdown(); // Shut down HTTP/Socket.IO server
	sm.shutdown(); // Shutdown site manager
	store.shutdown(); // Shutdown data store
	logger.shutdown(); // Shutdown logger
});
