meshmap.namespace("meshmap.map.factories");

meshmap.map.factories.extentUpdaterFactory = (function() {

	// imports
	var CommsService = meshmap.utils.comms.CommsService,
		ExtentUpdater = meshmap.map.ExtentUpdater,
		ExtentUpdateStrategy = meshmap.map.ExtentUpdateStrategy;

	var instance = null;

	var create = function() {
		if(!instance) {
			instance = createExtentUpdater();
		}
		return instance;
	};

	var createExtentUpdater = function() {
		var extentUpdater = new ExtentUpdater(new ExtentUpdateStrategy(), CommsService.instance);
		return extentUpdater;
	};

	return {
		create: create
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.factories.extentUpdaterFactory;
}
