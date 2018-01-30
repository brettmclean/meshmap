require("../../testUtils/init");
var loader = require("../../testUtils/loader");

var CommsProviderBase = loader.load("utils/comms/CommsProviderBase"),
	ValueError = loader.load("errors/ValueError"),
	Message = loader.load("model/datamodel").Message;

var DUMMY_CONN_STR = "localhost:1234";

var verifyMethodExists = function(methodName) {
	var cp = new CommsProviderBase(DUMMY_CONN_STR);
	expect(typeof cp[methodName]).toBe("function");
};

var simulateReceivedMessage = function(cp, message) {
	cp._onMessageReceived(message);
};

var simulateCommsError = function(cp, errMsg) {
	cp._onError(errMsg);
};

describe("A Comms Provider", function() {

	it("throws a TypeError if provided a non-String in constructor", function() {
		expect(function() {
			// jshint unused: false
			var cp = new CommsProviderBase(123);
		}).toThrowError(TypeError);
	});

	it("throws a ValueError if provided an empty String in constructor", function() {
		expect(function() {
			// jshint unused: false
			var cp = new CommsProviderBase("");
		}).toThrowError(ValueError);
	});

	it("has a connect method", verifyMethodExists.bind(this, "connect"));

	it("has a disconnect method", verifyMethodExists.bind(this, "disconnect"));

	it("has an isConnected method", verifyMethodExists.bind(this, "isConnected"));

	it("has a send method", verifyMethodExists.bind(this, "send"));

	it("has a sendWithType method", verifyMethodExists.bind(this, "sendWithType"));

	it("returns a Boolean from its isConnected method", function() {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var returnValue = cp.isConnected();
		expect(typeof returnValue).toBe("boolean");
	});

	it("fires connected and disconnected events", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		expect(cp.isConnected()).toBe(false);

		cp.bind("connected", function() {
			expect(cp.isConnected()).toBe(true);
			cp.disconnect();
		});

		cp.bind("disconnected", function() {
			expect(cp.isConnected()).toBe(false);
			done();
		});

		cp.connect();
	});

	it("fires messageReceived events", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var msg = new Message("messageType", "messageData");
		var msgStr = JSON.stringify(msg);

		cp.bind("messageReceived", function(m) {
			expect(m).toBe(msgStr);
			done();
		});

		simulateReceivedMessage(cp, msgStr);
	});

	it("fires error events", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		var errMsg = "Socket error";

		cp.bind("error", function(em) {
			expect(em).toBe(errMsg);
			done();
		});

		simulateCommsError(cp, errMsg);
	});

	it("does not throw an Error during communications error", function() {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		expect(function() {
			simulateCommsError(cp, "Error message");
		}).not.toThrow();
	});

	it("should not attempt to connect if it is already connected", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		cp.connect();

		var timesConnected = 0;
		cp.bind("connected", function() {
			timesConnected++;

			if(timesConnected > 1) {
				fail("Connected while already connected");
			}

			cp.connect();
			setTimeout(done, 0);
		});
	});

	it("does not throw an Error if send is provided with an invalid callback function", function() {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);

		expect(function() {
			cp.send("Message data", null);
			cp.send("Message data", "NotAFunction");
		}).not.toThrow();
	});

	it("calls callback function when send response is received", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		cp.send("Message data", done);
	});

	it("calls callback function when sendWithType response is received", function(done) {
		var cp = new CommsProviderBase(DUMMY_CONN_STR);
		cp.sendWithType("Message type", "Message data", done);
	});

});
