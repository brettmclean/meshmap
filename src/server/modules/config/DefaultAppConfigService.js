var AppConfig = require("./AppConfig");

var dm = require("../datamodel");

var DefaultAppConfigService = function() {

};

DefaultAppConfigService.prototype.generateDefaultConfig = function() {
	var appConfig = new AppConfig();

	populateBaseProperties(appConfig);
	populateStoreProperties(appConfig);
	populateLoggingProperties(appConfig);
	populateSiteDefaultsProperties(appConfig);
	populateLimitsProperties(appConfig);

	return appConfig;
};

var populateBaseProperties = function(appConfig) {
	appConfig.portNumber = 8888;
	appConfig.siteCodeLength = 10;
	appConfig.apiPath = "/api";
	appConfig.apiKey = null;
};

var populateStoreProperties = function(appConfig) {
	var store = appConfig.store;
	store.type = store.TYPE_MEMORY;
	store.connectionString = null;
	store.maxConnections = 10;
};

var populateLoggingProperties = function(appConfig) {
	var logging = appConfig.logging;
	logging.level = logging.LEVEL_INFO;
	logging.directory = "logs";
	logging.logToConsole = true;
};

var populateSiteDefaultsProperties = function(appConfig) {
	var siteDefaults = appConfig.siteDefaults;
	siteDefaults.onlyOwnerCanEdit = false;
	siteDefaults.initialExtent = new dm.MapExtent(
		new dm.Location(20, -140),
		new dm.Location(60, -55)
	);
};

var populateLimitsProperties = function(appConfig) {
	var limits = appConfig.limits;
	limits.newSitesPerIpPerHour = 50;
	limits.allowedEventLoopLagMs = 300;
	limits.avoidCachingAboveHeapSizeMib = 1024;
};

module.exports = DefaultAppConfigService;
