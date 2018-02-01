var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var ConsoleLogProvider = function() {

};
ConsoleLogProvider.prototype = Object.create(baseProto);
ConsoleLogProvider.prototype.constructor = ConsoleLogProvider;

ConsoleLogProvider.prototype.error = function(message) {
	console.error(message);
};
ConsoleLogProvider.prototype.warn = function(message) {
	console.warn(message);
};
ConsoleLogProvider.prototype.info = function(message) {
	console.info(message);
};
ConsoleLogProvider.prototype.debug = function(message) {
	console.debug(message);
};
ConsoleLogProvider.prototype.trace = function(message) {
	this.debug(message);
};

module.exports = ConsoleLogProvider;
