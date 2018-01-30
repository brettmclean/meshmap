meshmap.namespace("meshmap.utils.comms");

/* istanbul ignore next */
meshmap.utils.comms.SocketIoCommsProvider = (function(socketIo) {

	// imports
	var CommsProviderBase = meshmap.utils.comms.CommsProviderBase;

	var baseClass = CommsProviderBase;
	var baseProto = baseClass.prototype;
	var SocketIoCommsProvider = function(connectionString) {
		baseClass.call(this, connectionString);
		validateSocketIoAvailable();
	};
	SocketIoCommsProvider.prototype = Object.create(baseProto);
	SocketIoCommsProvider.prototype.constructor = SocketIoCommsProvider;

	var validateSocketIoAvailable = function() {
		if(!socketIo) {
			throw new ReferenceError("Socket.IO must be included on page");
		}
	};

	SocketIoCommsProvider.prototype.connect = function() {
		if(this.isConnected()) {
			return;
		}

		if(!this._socket) {
			this._createNewSocket();
		} else {
			this._reconnectExistingSocket();
		}
	};

	SocketIoCommsProvider.prototype._createNewSocket = function() {
		this._socket = socketIo.connect(this._connectionString);
		this._socket.on("connect", this._onConnected.bind(this));
		this._socket.on("disconnect", this._onDisconnected.bind(this));
		this._socket.on("message", this._onMessageReceived.bind(this));
	};

	SocketIoCommsProvider.prototype._reconnectExistingSocket = function() {
		this._socket.socket.connect();
	};

	SocketIoCommsProvider.prototype.disconnect = function() {
		if(this.isConnected()) {
			this._socket.disconnect();
		}
	};

	SocketIoCommsProvider.prototype.send = function (data, callback) {
		this.sendWithType("message", data, callback);
	};

	SocketIoCommsProvider.prototype.sendWithType = function (type, data, callback) {
		if(this.isConnected()) {
			callback = typeof callback === "function" ? callback : function() {};
			this._socket.emit(type, data, callback);
		}
	};

	return SocketIoCommsProvider;
}(typeof io !== "undefined" ? io : null));

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.comms.SocketIoCommsProvider;
}
