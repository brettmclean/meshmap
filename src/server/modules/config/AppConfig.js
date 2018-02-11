var AppConfig = function() {
	this.portNumber = null;
	this.siteCodeLength = null;
	this.apiPath = null;
	this.apiKey = null;

	this.store = new AppStoreConfig();
	this.logging = new AppLoggingConfig();
	this.siteDefaults = new AppSiteDefaultsConfig();
	this.limits = new AppLimitsConfig();
};

var AppStoreConfig = function() {
	this.type = null;
	this.connectionString = null;
	this.maxConnections = null;
};

AppStoreConfig.prototype = {
	TYPE_MEMORY: "memory",
	TYPE_POSTGRESQL: "postgresql"
};

var AppLoggingConfig = function() {
	this.level = null;
	this.directory = null;
	this.logToConsole = null;
};

AppLoggingConfig.prototype = {
	LEVEL_ERROR: "error",
	LEVEL_WARN: "warn",
	LEVEL_INFO: "info",
	LEVEL_DEBUG: "debug",
	LEVEL_TRACE: "trace"
};

var AppSiteDefaultsConfig = function() {
	this.onlyOwnerCanEdit = null;
	this.initialExtent = null;
};

var AppLimitsConfig = function() {
	this.newSitesPerIpPerHour = null;
	this.allowedEventLoopLagMs = null;
	this.avoidCachingAboveHeapSizeMib = null;
};

AppConfig.AppStoreConfig = AppStoreConfig;
AppConfig.AppLoggingConfig = AppLoggingConfig;
AppConfig.AppSiteDefaultsConfig = AppSiteDefaultsConfig;
AppConfig.AppLimitsConfig = AppLimitsConfig;

module.exports = AppConfig;
