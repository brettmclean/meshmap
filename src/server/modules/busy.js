var applicationLoadServiceFactory = require("./appload/applicationLoadServiceFactory");

var applicationLoadService = applicationLoadServiceFactory.create();

function isTooBusy() {
	"use strict";

	return applicationLoadService.appIsOverloaded();
}

function init(config) {
	"use strict";

	loadConfig(config);
}

function loadConfig(config) {
	"use strict";

	applicationLoadService.setConfig(config.limits);
}

function shutdown() {
	"use strict";

	applicationLoadService.shutdown();
}

module.exports = isTooBusy;

module.exports.init = init;
module.exports.loadConfig = loadConfig;
module.exports.shutdown = shutdown;
