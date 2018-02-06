var ConsoleLogProvider = require("./ConsoleLogProvider");
var ConsoleOutputService = require("../utils/ConsoleOutputService");

var create = function() {
	var deps = {
		consoleOutputService: new ConsoleOutputService()
	};
	return new ConsoleLogProvider(deps);
};

module.exports.create = create;
