var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var ConsoleLogProvider = function() {

};
ConsoleLogProvider.prototype = Object.create(baseProto);
ConsoleLogProvider.prototype.constructor = ConsoleLogProvider;

module.exports = ConsoleLogProvider;
