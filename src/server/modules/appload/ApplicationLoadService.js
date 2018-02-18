var ApplicationLoadService = function(deps) {
	this._eventLoopLagProvider = deps.eventLoopLagProvider;
};

ApplicationLoadService.prototype.init = function() {

};

ApplicationLoadService.prototype.setConfig = function() {

};

ApplicationLoadService.prototype.appIsOverloaded = function() {
	return this._eventLoopLagProvider.lagIsTooHigh();
};

ApplicationLoadService.prototype.shutdown = function() {

};

module.exports = ApplicationLoadService;
