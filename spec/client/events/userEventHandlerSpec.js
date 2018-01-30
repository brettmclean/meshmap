require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteService = loader.load("state/SiteService"),
	EventBus = loader.load("events/EventBus"),
	UserEventHandler = loader.load("events/messageHandlers/UserEventHandler"),
	dm = loader.load("model/datamodel"),
	UserEvent = dm.UserEvent,
	UserInfo = dm.UserInfo;

var createUserEventHandler = function() {
	return new UserEventHandler();
};

var createUserEventHandlerWithSiteService = function(siteService) {
	return new UserEventHandler({
		siteService: siteService
	});
};

var createUserEventHandlerWithEventBus = function(eventBus) {
	return new UserEventHandler({
		eventBus: eventBus
	});
};

var USER_INFO1 = new UserInfo(8, "John");
var USER_INFO2 = new UserInfo(9, "Jane");

var CONNECTION_USER_EVENT = new UserEvent(UserEvent.USER_CONNECT, USER_INFO1);

var DISCONNECTION_USER_EVENT = new UserEvent(UserEvent.USER_DISCONNECT, USER_INFO2);

var UPDATE_USER_EVENT = new UserEvent(UserEvent.USER_UPDATE, USER_INFO1);

describe("A user event handler", function() {

	it("does not throw error if site service and event bus are not provided", function() {
		var ueh = createUserEventHandler();

		expect(function() {
			ueh.handle(CONNECTION_USER_EVENT);
			ueh.handle(DISCONNECTION_USER_EVENT);
			ueh.handle(UPDATE_USER_EVENT);
		}).not.toThrow();

	});

	it("adds newly connected user to site service", function() {
		var ss = new SiteService(),
			ueh = createUserEventHandlerWithSiteService(ss);

		spyOn(ss, "addUser");
		ueh.handle(CONNECTION_USER_EVENT);

		expect(ss.addUser).toHaveBeenCalledWith(USER_INFO1);
	});

	it("generates system message when new user connects", function(done) {
		var eb = new EventBus(),
			ueh = createUserEventHandlerWithEventBus(eb);

		eb.subscribe("systemMessageRequested", function(sysMsg) {
			expect(sysMsg).toContain(USER_INFO1.name);
			expect(sysMsg).toContain("joined");
			done();
		});

		ueh.handle(CONNECTION_USER_EVENT);
	});

	it("removes recently disconnected user from site service", function() {
		var ss = new SiteService(),
			ueh = createUserEventHandlerWithSiteService(ss);

		spyOn(ss, "removeUser");
		ueh.handle(DISCONNECTION_USER_EVENT);

		expect(ss.removeUser).toHaveBeenCalledWith(USER_INFO2.id);
	});

	it("generates system message when new user disconnects", function(done) {
		var eb = new EventBus(),
			ueh = createUserEventHandlerWithEventBus(eb);

		eb.subscribe("systemMessageRequested", function(sysMsg) {
			expect(sysMsg).toContain(USER_INFO2.name);
			expect(sysMsg).toContain("left");
			done();
		});

		ueh.handle(DISCONNECTION_USER_EVENT);
	});

	it("defers updated user to site service", function() {
		var ss = new SiteService(),
			ueh = createUserEventHandlerWithSiteService(ss);

		spyOn(ss, "updateUser");
		ueh.handle(UPDATE_USER_EVENT);

		expect(ss.updateUser).toHaveBeenCalledWith(USER_INFO1);
	});

	it("does not throw error when given invalid user event", function() {
		var ueh = createUserEventHandlerWithSiteService(new SiteService());

		expect(function() {
			ueh.handle(new UserEvent("notAValidEventType", null));
		}).not.toThrow();
	});

});
