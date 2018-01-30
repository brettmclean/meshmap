var dm = require("../datamodel");

var FileAppConfigService = function(deps, configFilePath) {
	this._fileReadService = deps.fileReadService;
	this._configFilePath = configFilePath;
};

FileAppConfigService.prototype.readJsonFileAndApplyConfig = function(appConfig) {
	var jsonString = this._fileReadService.readAsUtf8StringSync(this._configFilePath);
	var rawConfig = JSON.parse(jsonString);

	copyPropertyValueIfExists(rawConfig, appConfig, ["portNumber"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["siteCodeLength"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["apiPath"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["apiKey"]);

	copyPropertyValueIfExists(rawConfig, appConfig, ["store", "type"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["store", "connectionString"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["store", "maxConnections"]);

	copyPropertyValueIfExists(rawConfig, appConfig, ["logging", "level"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["logging", "directory"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["logging", "logToConsole"]);

	copyPropertyValueIfExists(rawConfig, appConfig, ["siteDefaults", "onlyOwnerCanEdit"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["siteDefaults", "initialExtent"], transformMapExtentValue);

	copyPropertyValueIfExists(rawConfig, appConfig, ["limits", "newSitesPerIpPerHour"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["limits", "allowedEventLoopLagMs"]);
	copyPropertyValueIfExists(rawConfig, appConfig, ["limits", "avoidCachingAboveHeapSizeMib"]);

	return appConfig;
};

var copyPropertyValueIfExists = function(srcObj, destObj, propertyNamePath, transformFunc) {
	if(propertyNamePath.length === 1) {
		var propertyName = propertyNamePath[0];
		transformFunc = transformFunc || passthroughValue;
		if(srcObj.hasOwnProperty(propertyName)) {
			destObj[propertyName] = transformFunc(srcObj[propertyName]);
		}
		return;
	}

	var firstPropertyName = propertyNamePath[0];
	if(srcObj.hasOwnProperty(firstPropertyName)) {
		copyPropertyValueIfExists(srcObj[firstPropertyName], destObj[firstPropertyName], propertyNamePath.slice(1), transformFunc);
	}
};

var passthroughValue = function(rawObj) {
	return rawObj;
};

var transformMapExtentValue = function(rawObj) {
	return new dm.MapExtent(
		new dm.Location(rawObj.minLat, rawObj.minLng),
		new dm.Location(rawObj.maxLat, rawObj.maxLng)
	);
};

module.exports = FileAppConfigService;
