require("../testUtils/init");
var loader = require("../testUtils/loader");

var EventBus = loader.load("events/EventBus");

describe("An Event Bus", function() {
	it("can register subscribers and publish events to them", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var eventValue = "My event argument";

		eb.subscribe(eventName, function(arg) {
			expect(arg).toBe(eventValue);
			done();
		});

		eb.publish(eventName, eventValue);
	});

	it("can register multiple subscribers and publish a single event to each of them", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var handlerCount = 3;
		var handlersCalled = 0;

		var eventHandler = function() {
			handlersCalled++;
			if(handlersCalled === handlerCount) {
				done();
			}
		};

		for(var i = 0; i < handlerCount; i++) {
			eb.subscribe(eventName, eventHandler);
		}

		eb.publish(eventName);
	});

	it("allows client code to unsubscribe from subscribed events", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var eventArg = "myArg";

		eb.subscribe(eventName, function(arg) {
			expect(arg).toBe(eventArg);
			done();
		});

		var unsubscribeFunction = eb.subscribe(eventName, function() {
			throw new Error("Should not get here due to unsubscribe function");
		});

		unsubscribeFunction();

		eb.publish(eventName, eventArg);
	});

	it("will push sticky events to late subscribers", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var expectedEventArg = "My value";

		eb.publishSticky(eventName, expectedEventArg);

		eb.subscribe(eventName, function(arg) {
			expect(arg).toBe(expectedEventArg);
			done();
		});
	});

	it("will not push non-sticky events to late subscribers", function() {
		var eb = new EventBus();

		var eventName = "myEvent";

		eb.publish(eventName);

		eb.subscribe(eventName, function() {
			throw new Error("Should not get here due to non-sticky event");
		});
	});

	it("will only push latest sticky event to late subscriber", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var eventArg1 = "One";
		var eventArg2 = "Two";

		eb.publishSticky(eventName, eventArg1);
		eb.publishSticky(eventName, eventArg2);

		eb.subscribe(eventName, function(arg) {
			expect(arg).toBe(eventArg2);
			done();
		});
	});

	it("will not replace sticky event values with non-sticky values", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var eventArg1 = "One";
		var eventArg2 = "Two";

		eb.publishSticky(eventName, eventArg1);
		eb.publish(eventName, eventArg2);

		eb.subscribe(eventName, function(arg) {
			expect(arg).toBe(eventArg1);
			done();
		});
	});

	it("does not share events between instances", function() {
		var eb1 = new EventBus();
		var eb2 = new EventBus();

		var eventName = "myEvent";
		eb1.subscribe(eventName, function() {
			throw new Error("Should not get here due to separate EventBus instance");
		});

		eb2.publish(eventName);
	});

	it("supports multiple events per instance", function() {
		var eb = new EventBus();

		var eventName = "myEvent";
		var eventName2 = "myEvent2";

		eb.subscribe(eventName, function() {
			throw new Error("Should not get here due to separate event");
		});

		eb.publish(eventName2);
	});

	it("should allow an arbitrary number of event arguments", function(done) {
		var eb = new EventBus();

		var eventName = "myEvent";
		var expectedSum = 10;

		eb.subscribe(eventName, function() {
			var sum = 0;
			for(var i = 0; i < arguments.length; i++) {
				sum += arguments[i];
			}
			expect(sum).toBe(expectedSum);
			done();
		});

		eb.publish(eventName, 1, 2, 3, 4);
	});

});
