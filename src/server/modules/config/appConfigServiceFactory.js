var path = require("path");

var AppConfigService = require("./AppConfigService");
var AppConfigCacheService = require("./AppConfigCacheService");
var DefaultAppConfigService = require("./DefaultAppConfigService");
var FileAppConfigService = require("./FileAppConfigService");
var FileReadService = require("../utils/FileReadService");
var appCacheFactory = require("../cache/appCacheFactory");
var configLocationManagement = require("./configLocationManagement");

var create = function() {
	return new AppConfigService({
		appConfigCacheService: createAppConfigCacheService(),
		defaultAppConfigService: createDefaultAppConfigService(),
		fileAppConfigService: createFileAppConfigService()
	});
};

var createAppConfigCacheService = function() {
	var deps = {
		appCache: appCacheFactory.create()
	};
	return new AppConfigCacheService(deps);
};

var createDefaultAppConfigService = function() {
	return new DefaultAppConfigService();
};

var createFileAppConfigService = function() {
	var deps = {
		fileReadService: new FileReadService()
	};
	return new FileAppConfigService(deps, getConfigJsonPath());
};

var getConfigJsonPath = function() {
	var configDir = configLocationManagement.getConfigDirectory();
	var configFilePath = path.join(configDir, "server.json");
	return configFilePath;
};

module.exports.create = create;
