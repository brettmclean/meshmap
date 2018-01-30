meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.UserEventHandler = (function() {

	// imports
	var dm = meshmap.models,
		UserEvent = dm.UserEvent;

	var UserEventHandler = function(deps) {
		deps = deps || {};

		this._siteService = deps.siteService || null;
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

	var EVENT_TYPE_HANDLER_MAPPINGS = {};

	EVENT_TYPE_HANDLER_MAPPINGS[UserEvent.USER_CONNECT] = function(userEvent) {
		var userInfo = userEvent.data;

		var sysMsg = userInfo.name + " has joined.";
		fireEventWithArg.call(this, "systemMessageRequested", sysMsg);

		if(this._siteService) {
			this._siteService.addUser(userInfo);
		}
	};

	EVENT_TYPE_HANDLER_MAPPINGS[UserEvent.USER_DISCONNECT] = function(userEvent) {
		var userInfo = userEvent.data;

		var sysMsg = userInfo.name + " has left.";
		fireEventWithArg.call(this, "systemMessageRequested", sysMsg);

		if(this._siteService) {
			this._siteService.removeUser(userInfo.id);
		}
	};

	EVENT_TYPE_HANDLER_MAPPINGS[UserEvent.USER_UPDATE] = function(userEvent) {
		var userInfo = userEvent.data;

		if(this._siteService) {
			this._siteService.updateUser(userInfo);
		}
	};

	UserEventHandler.prototype.handle = function(userEvent) {
		var handlerFunc = EVENT_TYPE_HANDLER_MAPPINGS[userEvent.type];

		if(typeof handlerFunc === "function") {
			handlerFunc.call(this, userEvent);
		}
	};

	return UserEventHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.UserEventHandler;
}
