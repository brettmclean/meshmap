meshmap.namespace("meshmap.utils.comms");

meshmap.utils.comms.CommsProviderBase = (function() {

	// imports
	var ValueError = meshmap.errors.ValueError,
		observable = MicroEvent.mixin;

	var CommsProviderBase = function(connectionString) {
		validateConnectionString(connectionString);
		this._connectionString = connectionString;
		this._isConnected = false;
	};

	var validateConnectionString = function(connectionString) {
		if(typeof connectionString !== "string") {
			throw new TypeError("Connection string must be of type String");
		}
		if(connectionString.length <= 0) {
			throw new ValueError("Connection string cannot be empty");
		}
	};

	CommsProviderBase.prototype.connect = function() {
		if(this.isConnected()) {
			return;
		}
		setTimeout(this._onConnected.bind(this), 0);
	};

	CommsProviderBase.prototype._onConnected = function() {
		this._isConnected = true;
		this.trigger("connected");
	};

	CommsProviderBase.prototype.disconnect = function() {
		this._onDisconnected();
	};

	CommsProviderBase.prototype._onDisconnected = function() {
		this._isConnected = false;
		this.trigger("disconnected");
	};

	CommsProviderBase.prototype.isConnected = function() {
		return this._isConnected;
	};

	CommsProviderBase.prototype.send = function (data, callback) {
		/* jshint unused:vars */
		callback = this._ensureValidCallback(callback);
		callback();
	};

	CommsProviderBase.prototype.sendWithType = function (type, data, callback) {
		/* jshint unused:vars */
		callback = this._ensureValidCallback(callback);
		callback();
	};

	CommsProviderBase.prototype._ensureValidCallback = function(callback) {
		return typeof callback === "function" ? callback : function() {};
	};

	CommsProviderBase.prototype._onMessageReceived = function(message) {
		this.trigger("messageReceived", message);
	};

	CommsProviderBase.prototype._onError = function(errorMsg) {
		this.trigger("error", errorMsg);
	};

	observable(CommsProviderBase.prototype);

	return CommsProviderBase;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.comms.CommsProviderBase;
}
