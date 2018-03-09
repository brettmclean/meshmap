meshmap.namespace("meshmap.events");

meshmap.events.EventBus = (function() {

	var RegisteredEvent = function() {
		this.handlers = [];
	};
	RegisteredEvent.prototype.addHandler = function(handler) {
		this.handlers.push(handler);
	};
	RegisteredEvent.prototype.removeHandler = function(handler) {
		for(var i = 0; i < this.handlers.length; i++) {
			if(this.handlers[i] === handler) {
				this.handlers.splice(i, 1);
				break;
			}
		}
	};

	var EventBus = function() {
		this._events = {};
		this._stickyEventArgs = {};
	};

	EventBus.prototype.publish = function(
		/* String */ eventName
		/* , arg1, arg2, ... */
	) {
		var eventArgs = Array.prototype.slice.call(arguments, 1);

		var regEvent = this._events[eventName];
		if(regEvent instanceof RegisteredEvent) {
			for(var i = 0; i < regEvent.handlers.length; i++) {
				var handler = regEvent.handlers[i];
				handler.apply(null, eventArgs);
			}
		}
	};

	EventBus.prototype.publishSticky = function(eventName	/* , arg1, arg2, ... */) {
		var eventArgs = Array.prototype.slice.call(arguments, 1);
		this._stickyEventArgs[eventName] = eventArgs;

		this.publish.apply(this, arguments);
	};

	EventBus.prototype.subscribe = function(eventName, handler) {
		if(typeof this._events[eventName] === "undefined") {
			this._events[eventName] = new RegisteredEvent(eventName);
		}

		this._events[eventName].addHandler(handler);

		if(typeof this._stickyEventArgs[eventName] !== "undefined") {
			handler.apply(null, this._stickyEventArgs[eventName]);
		}

		var regEvent = this._events[eventName];
		var unsubscribeFunction = function() {
			regEvent.removeHandler(handler);
		};

		return unsubscribeFunction;
	};

	return EventBus;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.EventBus;
}
