var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");
var logProviderFactory = require("./logging/factories/logProviderFactory");

var loggingService = loggingServiceFactory.create();

function init(config) {
	"use strict";

	loadConfig(config);
}

function loadConfig(config) {
	"use strict";

	loggingService.setConfig(config.logging);

	var providers = logProviderFactory.create(config.logging);
	for(var i = 0; i < providers.length; i++) {
		providers[i].init();
	}
	loggingService.setLogProviders(providers);
}

function shutdown() {
	"use strict";

	loggingService.shutdown();
}

function error(/* String */ message) {
	"use strict";
	loggingService.error(message);
}

function warn(/* String */ message) {
	"use strict";
	loggingService.warn(message);
}

function info(/* String */ message) {
	"use strict";
	loggingService.info(message);
}

function debug(/* String */ message) {
	"use strict";
	loggingService.debug(message);
}

function trace(/* String */ message) {
	"use strict";
	loggingService.trace(message);
}

exports.init = init;
exports.shutdown = shutdown;
exports.loadConfig = loadConfig;
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.debug = debug;
exports.trace = trace;
