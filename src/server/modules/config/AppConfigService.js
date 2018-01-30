var AppConfigService = function(deps) {
	this._appConfigCacheService = deps.appConfigCacheService;
	this._defaultAppConfigService = deps.defaultAppConfigService;
	this._fileAppConfigService = deps.fileAppConfigService;
};

AppConfigService.prototype.getAppConfig = function() {
	var appConfig = this._appConfigCacheService.getAppConfig();

	if(!appConfig) {
		appConfig = this._defaultAppConfigService.generateDefaultConfig();
		appConfig = this._fileAppConfigService.readJsonFileAndApplyConfig(appConfig);
		this._appConfigCacheService.setAppConfig(appConfig);
	}

	return appConfig;
};

AppConfigService.prototype.reloadAppConfig = function() {
	this._appConfigCacheService.removeAppConfig();
	return this.getAppConfig();
};

module.exports = AppConfigService;
