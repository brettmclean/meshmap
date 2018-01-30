meshmap.namespace("meshmap.utils.comms");

meshmap.utils.comms.commsProviderFactory = (function() {

	// imports
	var SocketIoCommsProvider = meshmap.utils.comms.SocketIoCommsProvider;

	var create = function(config) {
		var host = config.host;
		var port = config.port;
		var connStr = "//" + host + ":" + port;
		return new SocketIoCommsProvider(connStr);
	};

	return {
		create: create
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.comms.commsProviderFactory;
}
