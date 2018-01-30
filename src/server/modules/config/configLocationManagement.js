var path = require("path");

var getConfigDirectory = function() {
	var configDir = getEnvConfigDirectory() || getDefaultConfigDirectory();
	return configDir;
};

var getEnvConfigDirectory = function() {
	return process.env["MM_CONFIG_DIR"];
};

var getDefaultConfigDirectory = function() {
	return path.join(__dirname, "../../config/");
};

module.exports.getConfigDirectory = getConfigDirectory;
