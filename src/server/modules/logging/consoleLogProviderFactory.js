var ConsoleLogProvider = require("./ConsoleLogProvider");

var create = function() {
	return new ConsoleLogProvider();
};

module.exports.create = create;
