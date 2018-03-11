meshmap.namespace("meshmap.state.factories");

meshmap.state.factories.pageStateServiceFactory = (function() {

	// imports
	var PageStateService = meshmap.state.PageStateService,
		eventBusFactory = meshmap.events.factories.eventBusFactory;

	var instance = null;

	var create = function() {
		if(!instance) {
			instance = createPageStateService();
		}
		return instance;
	};

	var createPageStateService = function() {
		var eventBus = eventBusFactory.create();

		var pageStateService = new PageStateService({
			eventBus: eventBus
		});
		return pageStateService;
	};

	return {
		create: create
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.state.factories.pageStateServiceFactory;
}
