var LoggingService = require("../LoggingService");
var LogBufferService = require("../LogBufferService");
var consoleLogProviderFactory = require("./consoleLogProviderFactory");

var create = function() {
	var deps = {
		consoleLogProvider: consoleLogProviderFactory.create(),
		logBufferService: new LogBufferService()
	};
	return new LoggingService(deps);
};

module.exports.create = create;
