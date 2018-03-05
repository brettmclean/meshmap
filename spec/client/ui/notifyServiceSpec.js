require("../testUtils/init");
var loader = require("../testUtils/loader");

var NotifyService = loader.load("ui/NotifyService"),
	EventBus = loader.load("events/EventBus"),
	dm = loader.load("model/datamodel"),
	UserInfo = dm.UserInfo,
	ChatMessage = dm.ChatMessage,
	StartupData = dm.StartupData;

var USER_INFO1 = new UserInfo(8, "John");
var USER_INFO2 = new UserInfo(9, "Jane");

var LAYOUT = {
	SMALL: "small",
	LARGE: "large"
};

describe("A Notify Service", function() {

	it("has section IDs", function() {
		var sections = NotifyService.SECTIONS;

		expect(sections).toBeDefined();
		expect(typeof sections.USERS).toBe("string");
		expect(typeof sections.CHAT).toBe("string");
	});

	it("increments user count tiny text when user is added", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus, site) {
			site.addUser(USER_INFO1);

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 2, NotifyService.COLORS.GREEN, done));

			site.addUser(USER_INFO2);
		});
	});

	it("will not flash notification color if users section is active when user is added", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus, site) {
			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 1, null, done));

			goToUsersSection(eventBus);
			site.addUser(USER_INFO1);
		});
	});

	it("will flash notification color if users section is active and side panel is closed when user is added", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus, site) {
			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 1, NotifyService.COLORS.GREEN, done));

			goToUsersSection(eventBus);
			closeSidePanel(eventBus);
			site.addUser(USER_INFO1);
		});
	});

	it("will not flash notification color if users section is active, side panel is closed and layout is small when user is added", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus, site) {
			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 1, null, done));

			goToUsersSection(eventBus);
			closeSidePanel(eventBus);
			switchToSmallLayout(eventBus);
			site.addUser(USER_INFO1);
		});
	});

	it("decrements user count tiny text when user is added", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus, site) {
			site.addUser(USER_INFO2);

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 0, NotifyService.COLORS.RED, done));

			site.removeUser(USER_INFO2);
		});
	});

	it("will not flash notification color if users section is active when user is removed", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus, site) {
			site.addUser(USER_INFO1);
			site.addUser(USER_INFO2);

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 1, null, done));

			goToUsersSection(eventBus);
			site.removeUser(USER_INFO2);
		});
	});

	it("increments unread chat count when chat message is received", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus) {
			receiveChatMessage(eventBus);
			receiveChatMessage(eventBus);

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.CHAT, 3, NotifyService.COLORS.GREEN, done));

			receiveChatMessage(eventBus);
		});
	});

	it("will linger notification color when chat message is received", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus) {
			eventBus.subscribe("taskTinyTextChanged", function(tinyTextChange) {
				expect(tinyTextChange.notifyRemain).toBe(true);
				done();
			});

			receiveChatMessage(eventBus);
		});
	});

	it("will not set tiny text if chat section is active when chat message is received", function() {
		setupTestWithEventBusAndSiteService(function(eventBus) {
			eventBus.subscribe("taskTinyTextChanged", function(tinyTextChange) {
				if(tinyTextChange.text !== "") {
					fail("Should not set tiny text if chat section is active when chat message received");
				}
			});

			goToChatSection(eventBus);
			receiveChatMessage(eventBus);
		});
	});

	it("clears unread chat count and notify color when chat section becomes active", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus) {

			receiveChatMessage(eventBus);

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.CHAT, "", null, done));

			goToChatSection(eventBus);
		});
	});

	it("will resume counting unread chats when chat message is received after chat section is made inactive", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus) {
			receiveChatMessage(eventBus);
			goToChatSection(eventBus);
			goToUsersSection(eventBus);
			receiveChatMessage(eventBus);

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.CHAT, 2, NotifyService.COLORS.GREEN, done));

			receiveChatMessage(eventBus);
		});
	});

	it("updates users section tiny text when startup data is received", function(done) {
		setupTestWithEventBusAndSiteService(function(eventBus) {
			var startupData = new StartupData();
			startupData.users = [USER_INFO1, USER_INFO2];

			eventBus.subscribe("taskTinyTextChanged",
				createTinyTextChangedVerificationCallback(
					NotifyService.SECTIONS.USERS, 2, null, done));

			receiveStartupData(eventBus, startupData);
		});
	});

});

function createNotifyService(deps) {
	deps = deps || {};

	deps.eventBus = deps.eventBus || createEventBus();
	deps.siteService = deps.siteService || createSiteService(deps.eventBus);

	return new NotifyService(deps);
}

function createEventBus() {
	return new EventBus();
}

function createSiteService(eventBus) {
	var ss = new MockSiteService(eventBus);
	return ss;
}

function createTinyTextChangedVerificationCallback(
	expectedSectionId, expectedText, expectedNotifyColor, done) {
	return function (tinyTextChange) {
		expect(tinyTextChange.sectionId).toBe(expectedSectionId);
		expect(tinyTextChange.text).toBe(expectedText);
		expect(tinyTextChange.notifyColor).toBe(expectedNotifyColor);
		done();
	};
}

function setupTestWithEventBusAndSiteService(callback) {
	var eb = createEventBus(),
		ss = createSiteService(eb);

	createNotifyService({
		eventBus: eb,
		siteService: ss
	});

	callback(eb, ss);
}

function goToUsersSection(eventBus) {
	eventBus.publish("sectionChanged", NotifyService.SECTIONS.USERS);
}

function goToChatSection(eventBus) {
	eventBus.publish("sectionChanged", NotifyService.SECTIONS.CHAT);
}

function closeSidePanel(eventBus) {
	eventBus.publish("sidePanelToggled", false);
}

function switchToSmallLayout(eventBus) {
	eventBus.publish("layoutChanged", LAYOUT.SMALL);
}

function receiveStartupData(eventBus, startupData) {
	eventBus.publish("startupDataReceived", startupData);
}

function receiveChatMessage(eventBus) {
	eventBus.publish("chatMessageReceived", new ChatMessage("Hello"));
}

function MockSiteService(eventBus) {
	this._eventBus = eventBus;

	this._users = [];
}

MockSiteService.prototype.addUser = function(userInfo) {
	this._users.push(userInfo);
	this._eventBus.publish("userAdded", userInfo);
};

MockSiteService.prototype.removeUser = function(userInfo) {
	var index = this._users.indexOf(userInfo);
	this._users.splice(index, 1);
	this._eventBus.publish("userRemoved", userInfo);
};

MockSiteService.prototype.getUsers = function() {
	return this._users;
};
