var ApplicationLoadService = require("./ApplicationLoadService");
var EventLoopLagProvider = require("./EventLoopLagProvider");

var singletonInstance = null;

var create = function() {
	if(!singletonInstance) {
		singletonInstance = createApplicationLoadService();
	}

	return singletonInstance;
};

var createApplicationLoadService = function() {
	var deps = {
		eventLoopLagProvider: new EventLoopLagProvider()
	};

	return new ApplicationLoadService(deps);
};

module.exports.create = create;
