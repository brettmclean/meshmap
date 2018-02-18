var toobusy = require("toobusy-js");

var EventLoopLagProvider = function() {

};

EventLoopLagProvider.prototype.lagIsTooHigh = function() {
	return toobusy();
};

EventLoopLagProvider.prototype.setMaxAllowedLag = function(maxAllowedLagMs) {
	toobusy.maxLag(maxAllowedLagMs);
};

EventLoopLagProvider.prototype.shutdown = function() {
	toobusy.shutdown();
};

module.exports = EventLoopLagProvider;
