meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.extentUpdatingBootstrapper = (function() {

	// imports
	var CommsService = meshmap.utils.comms.CommsService,
		ExtentUpdateStrategy = meshmap.map.ExtentUpdateStrategy,
		ExtentUpdater = meshmap.map.ExtentUpdater;

	var init = function() {
		var extentUpdater = new ExtentUpdater(new ExtentUpdateStrategy(), CommsService.instance);
		extentUpdater.watchExtentChanges();
		extentUpdater.setAsSingletonInstance();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
