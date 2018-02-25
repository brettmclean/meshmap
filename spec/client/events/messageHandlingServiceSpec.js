require("../testUtils/init");
var loader = require("../testUtils/loader");

var EventBus = loader.load("events/EventBus"),
	MessageHandlingService = loader.load("events/MessageHandlingService"),
	StartupDataHandler = loader.load("events/messageHandlers/StartupDataHandler"),
	ConnectionHandler = loader.load("events/messageHandlers/ConnectionHandler"),
	PageUnloadHandler = loader.load("events/messageHandlers/PageUnloadHandler"),
	MapEventHandler = loader.load("events/messageHandlers/MapEventHandler"),
	ChatMessageHandler = loader.load("events/messageHandlers/ChatMessageHandler"),
	UserEventHandler = loader.load("events/messageHandlers/UserEventHandler"),
	ErrorMessageHandler = loader.load("events/messageHandlers/ErrorMessageHandler"),
	SiteSettingHandler = loader.load("events/messageHandlers/SiteSettingHandler"),
	dm = loader.load("model/datamodel"),
	StartupData = dm.StartupData,
	Message = dm.Message,
	MapEvent = dm.MapEvent,
	UserEvent = dm.UserEvent,
	UserInfo = dm.UserInfo,
	ChatMessage = dm.ChatMessage,
	SettingUpdate = dm.SettingUpdate;

var SITE_NAME = "My Map";

var STARTUP_DATA_OBJ = (function() {
	var sd = new StartupData();
	sd.siteName = SITE_NAME;

	return JSON.parse(JSON.stringify(sd));
}());

var createMessageHandlingServiceWithEventBus = function(eventBus) {
	return new MessageHandlingService({
		eventBus: eventBus
	});
};

var createMessageHandlingServiceWithEventBusAndStartupDataHandler = function(eventBus, startupDataHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		startupDataHandler: startupDataHandler
	});
};

var createMessageHandlingServiceWithEventBusAndConnectionHandler = function(eventBus, connectionHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		connectionHandler: connectionHandler
	});
};

var createMessageHandlingServiceWithEventBusAndPageUnloadHandler = function(eventBus, pageUnloadHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		pageUnloadHandler: pageUnloadHandler
	});
};

var createMessageHandlingServiceWithEventBusAndMapEventHandler = function(eventBus, mapEventHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		mapEventHandler: mapEventHandler
	});
};

var createMessageHandlingServiceWithEventBusAndUserEventHandler = function(eventBus, userEventHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		userEventHandler: userEventHandler
	});
};

var createMessageHandlingServiceWithEventBusAndChatMessageHandler = function(eventBus, chatMessageHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		chatMessageHandler: chatMessageHandler
	});
};

var createMessageHandlingServiceWithEventBusAndErrorMessageHandler = function(eventBus, errorMessageHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		errorMessageHandler: errorMessageHandler
	});
};

var createMessageHandlingServiceWithEventBusAndSiteSettingHandler = function(eventBus, siteSettingHandler) {
	return new MessageHandlingService({
		eventBus: eventBus,
		siteSettingHandler: siteSettingHandler
	});
};

describe("A Message Handling Service", function() {

	it("does not throw an error if event bus is not provided", function() {
		expect(function() {
			// jshint unused: false
			var mhs = new MessageHandlingService();
		}).not.toThrow();
	});

	it("does not throw an error if startup data handler is not provided", function() {
		// jshint unused: false
		var eb = new EventBus(),
			mhs = createMessageHandlingServiceWithEventBus(eb);

		expect(function() {
			eb.publish("startupDataReceived", STARTUP_DATA_OBJ);
		}).not.toThrow();
	});

	it("does not throw an error if connection handler is not provided", function() {
		// jshint unused: false
		var eb = new EventBus(),
			mhs = createMessageHandlingServiceWithEventBus(eb);

		expect(function() {
			eb.publish("disconnected");
			eb.publish("connected");
			eb.publish("pageUnloading");
		}).not.toThrow();
	});

	it("provides a parsed StartupData object to the startup data handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			sdh = createStartupDataHandler(),
			mhs = createMessageHandlingServiceWithEventBusAndStartupDataHandler(eb, sdh);

		eb.publish("startupDataReceived", STARTUP_DATA_OBJ);

		var firstCall = sdh.handle.calls.first();
		var startupDataArg = firstCall.args[0];
		expect(sdh.handle).toHaveBeenCalledWith(jasmine.any(StartupData));
		expect(startupDataArg.siteName).toBe(SITE_NAME);
	});

	it("defers handling a disconnection to the connection handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			ch = new ConnectionHandler({}),
			mhs = createMessageHandlingServiceWithEventBusAndConnectionHandler(eb, ch);

		spyOn(ch, "handleDisconnect");
		eb.publish("disconnected");

		expect(ch.handleDisconnect).toHaveBeenCalled();
	});

	it("defers handling a connection to the connection handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			ch = new ConnectionHandler({}),
			mhs = createMessageHandlingServiceWithEventBusAndConnectionHandler(eb, ch);

		spyOn(ch, "handleConnect");
		eb.publish("connected");

		expect(ch.handleConnect).toHaveBeenCalled();
	});

	it("defers page unloading to page unload handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			puh = createPageUnloadHandler(),
			mhs = createMessageHandlingServiceWithEventBusAndPageUnloadHandler(eb, puh);

		eb.publish("pageUnloading");

		expect(puh.handle).toHaveBeenCalled();
	});

	it("informs the connection handler when the page is unloading", function() {
		// jshint unused: false
		var eb = new EventBus(),
			ch = new ConnectionHandler({}),
			mhs = createMessageHandlingServiceWithEventBusAndConnectionHandler(eb, ch);

		spyOn(ch, "setPageUnloading");
		eb.publish("pageUnloading");

		expect(ch.setPageUnloading).toHaveBeenCalled();
	});

	it("defers map events to map event handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			meh = createMapEventHandler(),
			mhs = createMessageHandlingServiceWithEventBusAndMapEventHandler(eb, meh),
			mapEvent = new MapEvent(MapEvent.REMOVE_MARKER, 87),
			message = new Message(Message.MAP_EVENT, mapEvent);

		eb.publish("messageReceived", message);

		expect(meh.handle).toHaveBeenCalledWith(mapEvent);
	});

	it("defers user events to user event handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			ueh = new UserEventHandler(),
			mhs = createMessageHandlingServiceWithEventBusAndUserEventHandler(eb, ueh),
			userInfo = new UserInfo(14, "Jennifer"),
			userEvent = new UserEvent(UserEvent.USER_CONNECT, userInfo),
			message = new Message(Message.USER_EVENT, userEvent);

		spyOn(ueh, "handle");
		eb.publish("messageReceived", message);

		expect(ueh.handle).toHaveBeenCalledWith(userEvent);
	});

	it("defers chat message events to chat message handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			cmh = new ChatMessageHandler({}),
			mhs = createMessageHandlingServiceWithEventBusAndChatMessageHandler(eb, cmh),
			chatMessage = new ChatMessage("Hello!"),
			message = new Message(Message.CHAT_MESSAGE, chatMessage);

		spyOn(cmh, "handle");
		eb.publish("messageReceived", message);

		expect(cmh.handle).toHaveBeenCalledWith(chatMessage);
	});

	it("defers error message events to error message handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			emh = createErrorMessageHandler(),
			mhs = createMessageHandlingServiceWithEventBusAndErrorMessageHandler(eb, emh),
			errorMessage = "Network cable severed by honey badger",
			message = new Message(Message.ERROR, errorMessage);

		eb.publish("messageReceived", message);

		expect(emh.handle).toHaveBeenCalledWith(errorMessage);
	});

	it("defers site setting update events to site setting handler", function() {
		// jshint unused: false
		var eb = new EventBus(),
			ssh = createSiteSettingHandler(),
			mhs = createMessageHandlingServiceWithEventBusAndSiteSettingHandler(eb, ssh),
			su = new SettingUpdate(SettingUpdate.SITE_NAME, SITE_NAME),
			message = new Message(Message.UPDATE_SITE_SETTING, su);

		eb.publish("messageReceived", message);

		expect(ssh.handle).toHaveBeenCalledWith(su);
	});

});

function createErrorMessageHandler() {
	var emh = new ErrorMessageHandler({});
	spyOn(emh, "handle");
	return emh;
}

function createMapEventHandler() {
	var meh = new MapEventHandler({});
	spyOn(meh, "handle");
	return meh;
}

function createPageUnloadHandler() {
	var puh = new PageUnloadHandler({});
	spyOn(puh, "handle");
	return puh;
}

function createSiteSettingHandler() {
	var ssh = new SiteSettingHandler({});
	spyOn(ssh, "handle");
	return ssh;
}

function createStartupDataHandler() {
	var sdh = new StartupDataHandler({});
	spyOn(sdh, "handle");
	return sdh;
}
