require("../testUtils/init");
var loader = require("../testUtils/loader");

var SiteService = loader.load("state/SiteService"),
	EventBus = loader.load("events/EventBus"),
	UserEventHandler = loader.load("events/messageHandlers/UserEventHandler"),
	dm = loader.load("model/datamodel"),
	UserEvent = dm.UserEvent,
	UserInfo = dm.UserInfo;

var USER_INFO1 = new UserInfo(8, "John");
var USER_INFO2 = new UserInfo(9, "Jane");

var CONNECTION_USER_EVENT = new UserEvent(UserEvent.USER_CONNECT, USER_INFO1);

var DISCONNECTION_USER_EVENT = new UserEvent(UserEvent.USER_DISCONNECT, USER_INFO2);

var UPDATE_USER_EVENT = new UserEvent(UserEvent.USER_UPDATE, USER_INFO1);

describe("A user event handler", function() {

	it("adds newly connected user to site service", function() {
		var ss = createSiteService(),
			ueh = createUserEventHandler({ siteService: ss });

		ueh.handle(CONNECTION_USER_EVENT);

		expect(ss.addUser).toHaveBeenCalledWith(USER_INFO1);
	});

	it("generates system message when new user connects", function(done) {
		var eb = createEventBus(),
			ueh = createUserEventHandler({ eventBus: eb });

		eb.subscribe("systemMessageRequested", function(sysMsg) {
			expect(sysMsg).toContain(USER_INFO1.name);
			expect(sysMsg).toContain("joined");
			done();
		});

		ueh.handle(CONNECTION_USER_EVENT);
	});

	it("removes recently disconnected user from site service", function() {
		var ss = createSiteService(),
			ueh = createUserEventHandler({ siteService: ss });

		ueh.handle(DISCONNECTION_USER_EVENT);

		expect(ss.removeUser).toHaveBeenCalledWith(USER_INFO2.id);
	});

	it("generates system message when new user disconnects", function(done) {
		var eb = createEventBus(),
			ueh = createUserEventHandler({ eventBus: eb });

		eb.subscribe("systemMessageRequested", function(sysMsg) {
			expect(sysMsg).toContain(USER_INFO2.name);
			expect(sysMsg).toContain("left");
			done();
		});

		ueh.handle(DISCONNECTION_USER_EVENT);
	});

	it("defers updated user to site service", function() {
		var ss = createSiteService(),
			ueh = createUserEventHandler({ siteService: ss });

		ueh.handle(UPDATE_USER_EVENT);

		expect(ss.updateUser).toHaveBeenCalledWith(USER_INFO1);
	});

	it("does not throw error when given invalid user event", function() {
		var ueh = createUserEventHandler();

		expect(function() {
			ueh.handle(new UserEvent("notAValidEventType", null));
		}).not.toThrow();
	});

});

function createUserEventHandler(deps) {
	deps = deps || {};

	deps.siteService = deps.siteService || createSiteService();
	deps.eventBus = deps.eventBus || createEventBus();

	return new UserEventHandler(deps);
}

function createSiteService() {
	var ss = new SiteService({});
	spyOn(ss, "updateUser");
	spyOn(ss, "removeUser");
	spyOn(ss, "addUser");
	return ss;
}

function createEventBus() {
	var eb = new EventBus();
	return eb;
}
