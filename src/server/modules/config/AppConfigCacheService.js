var CACHE_KEY = "AppConfig";

var AppConfigCacheService = function(deps) {
	this._appCache = deps.appCache;
};

AppConfigCacheService.prototype.getAppConfig = function() {
	return this._appCache.get(CACHE_KEY);
};

AppConfigCacheService.prototype.setAppConfig = function(appConfig) {
	this._appCache.set(CACHE_KEY, appConfig);
};

AppConfigCacheService.prototype.removeAppConfig = function() {
	this._appCache.remove(CACHE_KEY);
};

module.exports = AppConfigCacheService;
