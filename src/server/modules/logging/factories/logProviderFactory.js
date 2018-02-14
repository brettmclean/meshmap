var fileLogProviderFactory = require("./fileLogProviderFactory");

var create = function(loggingConfig) {
	var providers = [];

	addProviderToListIfNotNull(providers, createFileLogProvider(loggingConfig));

	return providers;
};

var createFileLogProvider = function(loggingConfig) {
	if(loggingConfig.directory) {
		return fileLogProviderFactory.create(loggingConfig.directory);
	}
	return null;
};

var addProviderToListIfNotNull = function(providers, provider) {
	if(provider) {
		providers.push(provider);
	}
	return providers;
};

module.exports.create = create;
