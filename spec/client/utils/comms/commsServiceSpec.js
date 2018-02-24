require("../../testUtils/init");
var loader = require("../../testUtils/loader");

var CommsProviderBase = loader.load("utils/comms/CommsProviderBase"),
	CommsService = loader.load("utils/comms/CommsService"),
	EventBus = loader.load("events/EventBus"),
	dm = loader.load("model/datamodel");

var DUMMY_CONN_STR = "localhost:1234";
var DUMMY_SITE_CODE = "abcdef";
var DUMMY_USER_SECRET = "0123456789abcdefghijklmnopqrstuvwxyz";

var createService = function(provider) {
	return new CommsService({
		provider: provider
	});
};

var verifyMethodExists = function(methodName) {
	var cs = createService(new CommsProviderBase(DUMMY_CONN_STR));
	expect(typeof cs[methodName]).toBe("function");
};

var simulateReceivedMessage = function(cp, message) {
	cp._onMessageReceived(message);
};

var verifyMessagesAreEqual = function(msg1, msg2) {
	expect(msg1.type).toBe(msg2.type);
	expect(msg1.data).toBe(msg2.data);
};

var verifyMethodWasCalledWithMessages = function(funcCalls, msgs) {
	expect(funcCalls.count()).toBe(msgs.length);

	var allCallArgs = funcCalls.allArgs();
	for(var i = 0; i < msgs.length; i++) {
		var callMsg = allCallArgs[i][0];
		verifyMessagesAreEqual(callMsg, msgs[i]);
	}
};

describe("A Comms Service", function() {

	it("throws a TypeError if not provided a valid CommsProviderBase", function() {
		expect(function() {
			createService({});
		}).toThrowError(TypeError);
	});

	it("does not throw an Error when provided a valid CommsProviderBase", function() {
		expect(function() {
			createService(new CommsProviderBase(DUMMY_CONN_STR));
		}).not.toThrow();
	});

	it("calls its provider's connect method immediately", function() {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		spyOn(cp, "connect");

		var cs = createService(cp); // jshint ignore:line

		expect(cp.connect.calls.count()).toBe(1);
	});

	it("has a setProvider method", verifyMethodExists.bind(this, "setProvider"));

	it("has a reconnect method", verifyMethodExists.bind(this, "reconnect"));

	it("calls its provider's connect method when attempting a reconnect", function() {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		spyOn(cp, "connect").and.callThrough();
		var funcCalls = cp.connect.calls;

		var cs = createService(cp);
		expect(funcCalls.count()).toBe(1);

		cp.disconnect();
		cs.reconnect();
		expect(funcCalls.count()).toBe(2);
	});

	it("only calls its provider's connect method during reconnect if provider is not already connected", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		spyOn(cp, "connect").and.callThrough();

		var cs = createService(cp);
		cp.bind("connected", function() {
			var funcCalls = cp.connect.calls;
			expect(funcCalls.count()).toBe(1);

			cs.reconnect();
			expect(funcCalls.count()).toBe(1);
			done();
		});
	});

	it("has a sendMessage method", verifyMethodExists.bind(this, "sendMessage"));

	it("calls its provider's send method when sending a message", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		spyOn(cp, "send");

		var cs = createService(cp);
		cp.bind("connected", function() {
			var funcCalls = cp.send.calls;
			cs.sendMessage("typeArg", "dataArg");

			expect(funcCalls.count()).toBe(1);

			var msg = funcCalls.first().args[0];
			expect(msg.type).toBe("typeArg");
			expect(msg.data).toBe("dataArg");
			done();
		});

	});

	it("has a sendConnectInfo method", verifyMethodExists.bind(this, "sendConnectInfo"));

	it("calls its provider's sendWithType method when sending connect info", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var connectInfo = new dm.ConnectInfo(DUMMY_SITE_CODE, DUMMY_USER_SECRET);

		var cs = createService(cp);
		cp.bind("connected", function() {
			spyOn(cp, "sendWithType");
			cs.sendConnectInfo(connectInfo);

			var funcCalls = cp.sendWithType.calls;
			expect(funcCalls.count()).toBe(1);

			var sendType = funcCalls.first().args[0];
			expect(sendType).toBe("connectInfo");

			var msg = funcCalls.first().args[1];
			expect(msg.data).toBe(connectInfo);

			done();
		});
	});

	it("calls a provided callback function when sending connect info", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var connectInfo = new dm.ConnectInfo(DUMMY_SITE_CODE, DUMMY_USER_SECRET);

		var cs = createService(cp);
		cp.bind("connected", function() {
			cs.sendConnectInfo(connectInfo, function() {
				done();
			});
		});
	});

	it("fires a connected event on the event bus when provider is connected", function(done) {
		var eb = new EventBus();
		var cp = new CommsProviderBase(DUMMY_CONN_STR);

		eb.subscribe("connected", done);
		var cs = new CommsService({ // jshint ignore:line
			provider: cp,
			eventBus: eb
		});
	});

	it("fires a disconnected event on the event bus when provider is disconnected", function(done) {
		var eb = new EventBus();
		var cp = new CommsProviderBase(DUMMY_CONN_STR);

		eb.subscribe("disconnected", done);
		var cs = new CommsService({ // jshint ignore:line
			provider: cp,
			eventBus: eb
		});
		cp.disconnect();
	});

	it("fires a messageReceived event on the event bus when provider receives message", function(done) {
		var eb = new EventBus();
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var msg = new dm.Message("msgType", "msgData");

		eb.subscribe("messageReceived", function(msg) {
			expect(msg.type).toBe("msgType");
			expect(msg.data).toBe("msgData");
			done();
		});
		var cs = new CommsService({ // jshint ignore:line
			provider: cp,
			eventBus: eb
		});
		simulateReceivedMessage(cp, msg);
	});

	it("can send connection info", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var cs = createService(cp);
		var connectInfo = new dm.ConnectInfo(DUMMY_SITE_CODE, DUMMY_USER_SECRET);

		cs.sendConnectInfo(connectInfo, done);
	});

	it("can share singleton instance", function() {
		var cs = createService(new CommsProviderBase(DUMMY_CONN_STR));
		cs.setAsSingletonInstance();

		expect(CommsService.instance).toBe(cs);
	});

	it("will queue messages and send them when given provider", function(done) {
		var msg1 = { type: "type1", data: "data1" };
		var msg2 = { type: "type2", data: "data2" };

		var cs = new CommsService({});
		cs.sendMessage(msg1.type, msg1.data);
		cs.sendMessage(msg2.type, msg2.data);

		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		spyOn(cp, "send");
		cs.setProvider(cp);

		cp.bind("connected", function() {
			var funcCalls = cp.send.calls;
			verifyMethodWasCalledWithMessages(funcCalls, [msg1, msg2]);
			done();
		});
	});

	it("will queue messages and send them when reconnected", function(done) {
		var msg1 = { type: "type1", data: "data1" };
		var msg2 = { type: "type2", data: "data2" };

		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		spyOn(cp, "send");

		var cs = new CommsService({
			provider: cp
		});

		var firstConnectedEvent = true;
		cp.bind("connected", function() {
			if(firstConnectedEvent) {
				cp.disconnect();
				firstConnectedEvent = false;
				cs.sendMessage(msg1.type, msg1.data);
				cs.sendMessage(msg2.type, msg2.data);
				cp.connect();
			} else {
				var funcCalls = cp.send.calls;
				verifyMethodWasCalledWithMessages(funcCalls, [msg1, msg2]);
				done();
			}
		});

	});

});
