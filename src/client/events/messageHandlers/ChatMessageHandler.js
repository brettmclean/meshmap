meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.ChatMessageHandler = (function() {

	var ChatMessageHandler = function(deps) {
		deps = deps || {};

		this._eventBus = deps.eventBus || null;
	};

	var fireEventWithArg = function(eventName, eventArg) {
		callEventBusPublish.call(this, [eventName, eventArg]);
	};

	var callEventBusPublish = function(publishArgs) {
		if(this._eventBus) {
			this._eventBus.publish.apply(this._eventBus, publishArgs);
		}
	};

	ChatMessageHandler.prototype.handle = function(chatMessage) {
		fireEventWithArg.call(this, "chatMessageReceived", chatMessage);
	};

	return ChatMessageHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.ChatMessageHandler;
}
