meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.ChatMessageHandler = (function() {

	var ChatMessageHandler = function(deps) {
		this._eventBus = deps.eventBus;
	};

	ChatMessageHandler.prototype.handle = function(chatMessage) {
		fireEventWithArg.call(this, "chatMessageReceived", chatMessage);
	};

	var fireEventWithArg = function(eventName, eventArg) {
		callEventBusPublish.call(this, [eventName, eventArg]);
	};

	var callEventBusPublish = function(publishArgs) {
		this._eventBus.publish.apply(this._eventBus, publishArgs);
	};

	return ChatMessageHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.ChatMessageHandler;
}
