require("../testUtils/init");
var loader = require("../testUtils/loader");

var ChatMessageHandler = loader.load("events/messageHandlers/ChatMessageHandler"),
	EventBus = loader.load("events/EventBus"),
	dm = loader.load("model/datamodel"),
	ChatMessage = dm.ChatMessage;

var CHAT_MESSAGE1 = new ChatMessage("Hello there");

var createChatMessageHandler = function() {
	return new ChatMessageHandler();
};

var createChatMessageHandlerWithEventBus = function(eventBus) {
	return new ChatMessageHandler({
		eventBus: eventBus
	});
};

describe("A chat message handler", function() {

	it("does not throw error if event bus is not provided", function() {
		var cmh = createChatMessageHandler();

		expect(function() {
			cmh.handle(CHAT_MESSAGE1);
		}).not.toThrow();
	});

	it("fires a chatMessageReceived event when a chat message is received", function(done) {
		var eb = new EventBus(),
			cmh = createChatMessageHandlerWithEventBus(eb);

		eb.subscribe("chatMessageReceived", function(chatMessage) {
			expect(chatMessage).toBe(CHAT_MESSAGE1);
			done();
		});

		cmh.handle(CHAT_MESSAGE1);
	});

});
