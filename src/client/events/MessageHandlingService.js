meshmap.namespace("meshmap.events");

meshmap.events.MessageHandlingService = (function() {

	// imports
	var dm = meshmap.models,
		StartupData = dm.StartupData,
		Message = dm.Message,
		UserEvent = dm.UserEvent;

	var MessageHandlingService = function(deps) {
		deps = deps || /* istanbul ignore next */ {};

		this._eventBus = deps.eventBus || null;
		this._startupDataHandler = deps.startupDataHandler || null;
		this._connectionHandler = deps.connectionHandler || null;
		this._pageUnloadHandler = deps.pageUnloadHandler || null;
		this._mapEventHandler = deps.mapEventHandler || null;
		this._userEventHandler = deps.userEventHandler || null;
		this._chatMessageHandler = deps.chatMessageHandler || null;
		this._errorMessageHandler = deps.errorMessageHandler || null;
		this._siteSettingHandler = deps.siteSettingHandler || null;

		subscribeToEvents.call(this);
	};

	var subscribeToEvents = function() {
		if(this._eventBus) {
			this._eventBus.subscribe("startupDataReceived", onStartupDataReceived.bind(this));
			this._eventBus.subscribe("disconnected", onDisconnected.bind(this));
			this._eventBus.subscribe("connected", onConnected.bind(this));
			this._eventBus.subscribe("messageReceived", onMessageReceived.bind(this));
			this._eventBus.subscribe("pageUnloading", onPageUnloading.bind(this));
		}
	};

	var onStartupDataReceived = function(startupData) {
		if(this._startupDataHandler) {
			startupData = StartupData.parse(startupData);
			this._startupDataHandler.handle(startupData);
		}
	};

	var onDisconnected = function() {
		if(this._connectionHandler) {
			this._connectionHandler.handleDisconnect();
		}
	};

	var onConnected = function() {
		if(this._connectionHandler) {
			this._connectionHandler.handleConnect();
		}
	};

	var onMessageReceived = function(message) {
		switch(message.type) {
			case Message.MAP_EVENT:
				if(this._mapEventHandler) {
					this._mapEventHandler.handle(message.data);
				}
				break;
			case Message.USER_EVENT:
				if(this._userEventHandler) {
					var userEvent = UserEvent.parse(message.data);
					this._userEventHandler.handle(userEvent);
				}
				break;
			case Message.CHAT_MESSAGE:
				if(this._chatMessageHandler) {
					this._chatMessageHandler.handle(message.data);
				}
				break;
			case Message.ERROR:
				if(this._errorMessageHandler) {
					this._errorMessageHandler.handle(message.data);
				}
				break;
			case Message.UPDATE_SITE_SETTING:
				if(this._siteSettingHandler) {
					this._siteSettingHandler.handle(message.data);
				}
				break;
		}
	};

	var onPageUnloading = function() {
		if(this._connectionHandler) {
			this._connectionHandler.setPageUnloading();
		}
		if(this._pageUnloadHandler) {
			this._pageUnloadHandler.handle();
		}
	};

	return MessageHandlingService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.MessageHandlingService;
}
