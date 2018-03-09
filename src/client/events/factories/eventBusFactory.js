meshmap.namespace("meshmap.events.factories");

meshmap.events.factories.eventBusFactory = (function() {

	// imports
	var EventBus = meshmap.events.EventBus;

	var instance = null;

	var create = function() {
		if(!instance) {
			instance = createEventBus();
		}
		return instance;
	};

	var createEventBus = function() {
		var eventBus = new EventBus();
		return eventBus;
	};

	return {
		create: create
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.factories.eventBusFactory;
}
