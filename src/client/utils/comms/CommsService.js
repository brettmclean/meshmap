meshmap.namespace("meshmap.utils.comms");

meshmap.utils.comms.CommsService = (function() {

	// imports
	var CommsProviderBase = meshmap.utils.comms.CommsProviderBase;

	var CommsService = function(deps) {
		this._messageQueue = [];

		this._logger = deps.logger;
		this._eventBus = deps.eventBus;
	};

	var validateLogProvider = function(provider) {
		if(provider && !(provider instanceof CommsProviderBase)) {
			throw new TypeError("Supplied comms provider must be of type CommsProviderBase");
		}
	};

	CommsService.instance = null;

	CommsService.prototype._subscribeToProviderEvents = function() {
		this._commsProvider.bind("connected", this._onProviderConnect.bind(this));
		this._commsProvider.bind("disconnected", this._onProviderDisconnect.bind(this));
		this._commsProvider.bind("messageReceived", this._onProviderMessage.bind(this));
		this._commsProvider.bind("error", this._onProviderError.bind(this));
	};

	CommsService.prototype._onProviderConnect = function() {
		this._logInfo("Connected to server.");
		this._publishEvent("connected");
		this._sendAllMessagesInQueue();
	};

	CommsService.prototype._onProviderDisconnect = function() {
		this._logInfo("Disconnected from server.");
		this._publishEvent("disconnected");
	};

	CommsService.prototype._onProviderMessage = function(message) {
		this._logTrace("Received: " + JSON.stringify(message, null, "\t"));
		this._publishEvent("messageReceived", message);
	};

	CommsService.prototype._onProviderError = function(errorMsg) {
		this._logError("A communications error occurred: " + errorMsg);
	};

	CommsService.prototype._logError = function(text) {
		this._logText("error", text);
	};

	CommsService.prototype._logInfo = function(text) {
		this._logText("info", text);
	};

	CommsService.prototype._logTrace = function(text) {
		this._logText("trace", text);
	};

	CommsService.prototype._logText = function(loggerMethod, text) {
		if(this._logger) {
			this._logger[loggerMethod](text);
		}
	};

	CommsService.prototype._publishEvent = function(eventName, argument) {
		if(this._eventBus) {
			this._eventBus.publish(eventName, argument);
		}
	};

	CommsService.prototype._publishStickyEvent = function(eventName, argument) {
		if(this._eventBus) {
			this._eventBus.publishSticky(eventName, argument);
		}
	};

	CommsService.prototype.setProvider = function(provider) {
		validateLogProvider(provider);
		this._commsProvider = provider;

		this._subscribeToProviderEvents();
		this._commsProvider.connect();
	};

	CommsService.prototype.reconnect = function() {
		if(!this._commsProvider.isConnected()) {
			this._commsProvider.connect();
		}
	};

	CommsService.prototype.sendMessage = function(messageType, messageData) {
		var msg = new meshmap.models.Message(messageType, messageData);
		if(this._canSendMessage()) {
			this._sendMessageViaProvider(msg);
		} else {
			this._messageQueue.push(msg);
		}
	};

	CommsService.prototype._sendAllMessagesInQueue = function() {
		while(this._canSendMessage() && this._messageQueue.length > 0) {
			var msg = this._messageQueue[0];
			this._sendMessageViaProvider(msg);
			this._messageQueue.shift();
		}
	};

	CommsService.prototype._sendMessageViaProvider = function(msg) {
		this._commsProvider.send(msg);
		this._logTrace("Sent: " + JSON.stringify(msg, null, "\t"));
	};

	CommsService.prototype._canSendMessage = function() {
		return !!this._commsProvider && this._commsProvider.isConnected();
	};

	CommsService.prototype.sendConnectInfo = function(connectInfo, callback) {
		var commsService = this;
		callback = typeof callback === "function" ? callback : function() {};

		if(this._commsProvider.isConnected()) {
			var connectMessage = new meshmap.models.Message("connectInfo", connectInfo);
			this._commsProvider.sendWithType("connectInfo", connectMessage, function(startupData) {
				commsService._logTrace("Received: " + JSON.stringify(startupData, null, "\t"));
				callback(startupData);
				if(startupData) {
					commsService._publishStickyEvent("startupDataReceived", startupData);
				}
			});
			commsService._logTrace("Sent: " + JSON.stringify(connectMessage, null, "\t"));
		} else {
			callback(null);
		}
	};

	CommsService.prototype.setAsSingletonInstance = function() {
		CommsService.instance = this;
	};

	return CommsService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.comms.CommsService;
}
