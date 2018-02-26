meshmap.namespace("meshmap.events");

meshmap.events.MessageHandlingService = (function() {

	// imports
	var dm = meshmap.models,
		StartupData = dm.StartupData,
		Message = dm.Message,
		UserEvent = dm.UserEvent;

	var MessageHandlingService = function(deps) {
		this._eventBus = deps.eventBus;
		this._startupDataHandler = deps.startupDataHandler;
		this._connectionHandler = deps.connectionHandler;
		this._pageUnloadHandler = deps.pageUnloadHandler;
		this._mapEventHandler = deps.mapEventHandler;
		this._userEventHandler = deps.userEventHandler;
		this._chatMessageHandler = deps.chatMessageHandler;
		this._errorMessageHandler = deps.errorMessageHandler;
		this._siteSettingHandler = deps.siteSettingHandler;

		subscribeToEvents.call(this);
	};

	var subscribeToEvents = function() {
		this._eventBus.subscribe("startupDataReceived", onStartupDataReceived.bind(this));
		this._eventBus.subscribe("disconnected", onDisconnected.bind(this));
		this._eventBus.subscribe("connected", onConnected.bind(this));
		this._eventBus.subscribe("messageReceived", onMessageReceived.bind(this));
		this._eventBus.subscribe("pageUnloading", onPageUnloading.bind(this));
	};

	var onStartupDataReceived = function(startupData) {
		startupData = StartupData.parse(startupData);
		this._startupDataHandler.handle(startupData);
	};

	var onDisconnected = function() {
		this._connectionHandler.handleDisconnect();
	};

	var onConnected = function() {
		this._connectionHandler.handleConnect();
	};

	var onMessageReceived = function(message) {
		switch(message.type) {
			case Message.MAP_EVENT:
				this._mapEventHandler.handle(message.data);
				break;
			case Message.USER_EVENT:
				var userEvent = UserEvent.parse(message.data);
				this._userEventHandler.handle(userEvent);
				break;
			case Message.CHAT_MESSAGE:
				this._chatMessageHandler.handle(message.data);
				break;
			case Message.ERROR:
				this._errorMessageHandler.handle(message.data);
				break;
			case Message.UPDATE_SITE_SETTING:
				this._siteSettingHandler.handle(message.data);
				break;
		}
	};

	var onPageUnloading = function() {
		this._connectionHandler.setPageUnloading();
		this._pageUnloadHandler.handle();
	};

	return MessageHandlingService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.MessageHandlingService;
}
