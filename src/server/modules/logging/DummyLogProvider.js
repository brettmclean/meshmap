var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var DummyLogProvider = function() {

};
DummyLogProvider.prototype = Object.create(baseProto);
DummyLogProvider.prototype.constructor = DummyLogProvider;

module.exports = DummyLogProvider;
