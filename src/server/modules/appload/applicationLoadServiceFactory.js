var ApplicationLoadService = require("./ApplicationLoadService");
var EventLoopLagProvider = require("./EventLoopLagProvider");

var create = function() {
	var deps = {
		eventLoopLagProvider: new EventLoopLagProvider()
	};

	return new ApplicationLoadService(deps);
};

module.exports.create = create;
