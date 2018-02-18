var ApplicationLoadService = function(deps) {
	this._eventLoopLagProvider = deps.eventLoopLagProvider;
};

ApplicationLoadService.prototype.init = function(appLimitsConfig) {
	this.setConfig(appLimitsConfig);
};

ApplicationLoadService.prototype.setConfig = function(appLimitsConfig) {
	this._eventLoopLagProvider.setMaxAllowedLag(appLimitsConfig.allowedEventLoopLagMs);
};

ApplicationLoadService.prototype.appIsOverloaded = function() {
	return this._eventLoopLagProvider.lagIsTooHigh();
};

ApplicationLoadService.prototype.shutdown = function() {
	this._eventLoopLagProvider.shutdown();
};

module.exports = ApplicationLoadService;
