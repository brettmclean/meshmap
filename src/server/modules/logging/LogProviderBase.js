var LogProviderBase = function() {

};

LogProviderBase.prototype.init = function() {};
LogProviderBase.prototype.error = function() {};
LogProviderBase.prototype.warn = function() {};
LogProviderBase.prototype.info = function() {};
LogProviderBase.prototype.debug = function() {};
LogProviderBase.prototype.trace = function() {};

module.exports = LogProviderBase;
