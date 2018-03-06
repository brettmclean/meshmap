meshmap.namespace("meshmap.startup.bootstrappers");

meshmap.startup.bootstrappers.extentUpdatingBootstrapper = (function() {

	// imports
	var extentUpdaterFactory = meshmap.map.factories.extentUpdaterFactory;

	var init = function() {
		var extentUpdater = extentUpdaterFactory.create();
		extentUpdater.watchExtentChanges();
	};

	return {
		init: init,
		ready: function() {}
	};

}());
