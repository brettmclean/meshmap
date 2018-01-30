meshmap.namespace("meshmap.startup");

meshmap.startup.bootstrapManager = (function() {

	// imports
	var commsBootstrapper = meshmap.startup.bootstrappers.commsBootstrapper,
		loggingBootstrapper = meshmap.startup.bootstrappers.loggingBootstrapper,
		trackingBootstrapper = meshmap.startup.bootstrappers.trackingBootstrapper,
		extentUpdatingBootstrapper = meshmap.startup.bootstrappers.extentUpdatingBootstrapper,
		siteBootstrapper = meshmap.startup.bootstrappers.siteBootstrapper,
		notifyBootstrapper = meshmap.startup.bootstrappers.notifyBootstrapper,
		pageStateBootstrapper = meshmap.startup.bootstrappers.pageStateBootstrapper,
		dialogBootstrapper = meshmap.startup.bootstrappers.dialogBootstrapper,
		messageHandlingBootstrapper = meshmap.startup.bootstrappers.messageHandlingBootstrapper,
		startupWorkflowBootstrapper = meshmap.startup.bootstrappers.startupWorkflowBootstrapper,
		mapBootstrapper = meshmap.startup.bootstrappers.mapBootstrapper;

	var pageBootstrappers = [];

	var init = function() {
		pageBootstrappers = getBootstrappers(getPageName());
		for(var i = 0; i < pageBootstrappers.length; i++) {
			pageBootstrappers[i].init();
		}
	};

	var ready = function() {
		for(var i = 0; i < pageBootstrappers.length; i++) {
			pageBootstrappers[i].ready();
		}
	};

	var getBootstrappers = function(pageName) {
		var result = [loggingBootstrapper, trackingBootstrapper];
		if(pageName === "map") {
			result.push(commsBootstrapper, extentUpdatingBootstrapper,
				siteBootstrapper, notifyBootstrapper, dialogBootstrapper,
				pageStateBootstrapper, messageHandlingBootstrapper,
				startupWorkflowBootstrapper, mapBootstrapper);
		}
		return result;
	};

	var getPageName = function() {
		var pageNameEl = document.getElementById("pageName");
		return pageNameEl ? pageNameEl.value : null;
	};

	init();

	return {
		ready: ready
	};
}());
