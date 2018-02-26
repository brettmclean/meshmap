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

describe("A Message Handling Service", function() {

	it("provides a parsed StartupData object to the startup data handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			sdh = createStartupDataHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				startupDataHandler: sdh
			});

		eb.publish("startupDataReceived", STARTUP_DATA_OBJ);

		var firstCall = sdh.handle.calls.first();
		var startupDataArg = firstCall.args[0];
		expect(sdh.handle).toHaveBeenCalledWith(jasmine.any(StartupData));
		expect(startupDataArg.siteName).toBe(SITE_NAME);
	});

	it("defers handling a disconnection to the connection handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			ch = createConnectionHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				connectionHandler: ch
			});

		eb.publish("disconnected");

		expect(ch.handleDisconnect).toHaveBeenCalled();
	});

	it("defers handling a connection to the connection handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			ch = createConnectionHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				connectionHandler: ch
			});

		eb.publish("connected");

		expect(ch.handleConnect).toHaveBeenCalled();
	});

	it("defers page unloading to page unload handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			puh = createPageUnloadHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				pageUnloadHandler: puh
			});

		eb.publish("pageUnloading");

		expect(puh.handle).toHaveBeenCalled();
	});

	it("informs the connection handler when the page is unloading", function() {
		// jshint unused: false
		var eb = createEventBus(),
			ch = createConnectionHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				connectionHandler: ch
			});

		eb.publish("pageUnloading");

		expect(ch.setPageUnloading).toHaveBeenCalled();
	});

	it("defers map events to map event handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			meh = createMapEventHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				mapEventHandler: meh
			}),
			mapEvent = new MapEvent(MapEvent.REMOVE_MARKER, 87),
			message = new Message(Message.MAP_EVENT, mapEvent);

		eb.publish("messageReceived", message);

		expect(meh.handle).toHaveBeenCalledWith(mapEvent);
	});

	it("defers user events to user event handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			ueh = createUserEventHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				userEventHandler: ueh
			}),
			userInfo = new UserInfo(14, "Jennifer"),
			userEvent = new UserEvent(UserEvent.USER_CONNECT, userInfo),
			message = new Message(Message.USER_EVENT, userEvent);

		eb.publish("messageReceived", message);

		expect(ueh.handle).toHaveBeenCalledWith(userEvent);
	});

	it("defers chat message events to chat message handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			cmh = createChatMessageHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				chatMessageHandler: cmh
			}),
			chatMessage = new ChatMessage("Hello!"),
			message = new Message(Message.CHAT_MESSAGE, chatMessage);

		eb.publish("messageReceived", message);

		expect(cmh.handle).toHaveBeenCalledWith(chatMessage);
	});

	it("defers error message events to error message handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			emh = createErrorMessageHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				errorMessageHandler: emh
			}),
			errorMessage = "Network cable severed by honey badger",
			message = new Message(Message.ERROR, errorMessage);

		eb.publish("messageReceived", message);

		expect(emh.handle).toHaveBeenCalledWith(errorMessage);
	});

	it("defers site setting update events to site setting handler", function() {
		// jshint unused: false
		var eb = createEventBus(),
			ssh = createSiteSettingHandler(),
			mhs = createMessageHandlingService({
				eventBus: eb,
				siteSettingHandler: ssh
			}),
			su = new SettingUpdate(SettingUpdate.SITE_NAME, SITE_NAME),
			message = new Message(Message.UPDATE_SITE_SETTING, su);

		eb.publish("messageReceived", message);

		expect(ssh.handle).toHaveBeenCalledWith(su);
	});

});

function createMessageHandlingService(deps) {
	deps = deps || {};

	deps.eventBus = deps.eventBus || new EventBus();
	deps.connectionHandler = deps.connectionHandler || createConnectionHandler();
	deps.startupDataHandler = deps.startupDataHandler || createStartupDataHandler();
	deps.pageUnloadHandler = deps.pageUnloadHandler || createPageUnloadHandler();
	deps.mapEventHandler = deps.mapEventHandler || createMapEventHandler();
	deps.userEventHandler = deps.userEventHandler || createUserEventHandler();
	deps.chatMessageHandler = deps.chatMessageHandler || createChatMessageHandler();
	deps.errorMessageHandler = deps.errorMessageHandler || createErrorMessageHandler();
	deps.siteSettingHandler = deps.siteSettingHandler || createSiteSettingHandler();

	return new MessageHandlingService(deps);
}

function createEventBus() {
	return new EventBus();
}

function createConnectionHandler() {
	var ch = new ConnectionHandler({});
	spyOn(ch, "handleDisconnect");
	spyOn(ch, "handleConnect");
	spyOn(ch, "setPageUnloading");
	return ch;
}

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

function createUserEventHandler() {
	var ueh = new UserEventHandler({});
	spyOn(ueh, "handle");
	return ueh;
}

function createChatMessageHandler() {
	var cmh = new ChatMessageHandler({});
	spyOn(cmh, "handle");
	return cmh;
}
