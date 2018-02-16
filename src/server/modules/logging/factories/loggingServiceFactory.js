var LoggingService = require("../LoggingService");
var LogBufferService = require("../LogBufferService");
var consoleLogProviderFactory = require("./consoleLogProviderFactory");

var singletonInstance = null;

var create = function() {
	if(!singletonInstance) {
		singletonInstance = createLoggingService();
	}

	return singletonInstance;
};

var createLoggingService = function() {
	var deps = {
		consoleLogProvider: consoleLogProviderFactory.create(),
		logBufferService: new LogBufferService()
	};
	return new LoggingService(deps);
};

module.exports.create = create;
