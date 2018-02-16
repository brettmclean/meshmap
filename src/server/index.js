"use strict";

var loggingServiceFactory = require("./modules/logging/factories/loggingServiceFactory");
var logProviderFactory = require("./modules/logging/factories/logProviderFactory");
var appConfigServiceFactory = require("./modules/config/appConfigServiceFactory");
var configLocationManagement = require("./modules/config/configLocationManagement");
var fileLogLocationServiceFactory = require("./modules/logging/factories/fileLogLocationServiceFactory");
var version = require("./modules/version");
var busy = require("./modules/busy");

var loggingService = loggingServiceFactory.create();

loggingService.info("Starting application" + (version ? " v" + version : "") + ".");
loggingService.info("Reading config from " + configLocationManagement.getConfigDirectory());

var appConfig = appConfigServiceFactory.create().getAppConfig();

var fileLogLocationService = fileLogLocationServiceFactory.create(appConfig.logging.directory);
var logDirectory = fileLogLocationService.getAbsoluteLogDirectory();
if(logDirectory) {
	loggingService.info(`Log files will be stored in ${logDirectory}`);
}

loggingService.init(appConfig.logging);

var providers = logProviderFactory.create(appConfig.logging);
providers.forEach((provider) => provider.init());
loggingService.setLogProviders(providers);

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
	loggingService.info("SIGINT received.");
	process.exit();
});

process.on("exit", function() {
	loggingService.info("Application is shutting down.");
	busy.shutdown(); // Shutdown toobusy event loop polling
	server.shutdown(); // Shut down HTTP/Socket.IO server
	sm.shutdown(); // Shutdown site manager
	store.shutdown(); // Shutdown data store
	loggingService.shutdown();
});
