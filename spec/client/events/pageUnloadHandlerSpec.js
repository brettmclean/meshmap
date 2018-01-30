require("../testUtils/init");
var loader = require("../testUtils/loader");

var PageUnloadHandler = loader.load("events/messageHandlers/PageUnloadHandler"),
	ExtentUpdater = loader.load("map/ExtentUpdater");

var createExtentUpdater = function() {
	return new ExtentUpdater();
};

var createPageUnloadHandler = function() {
	return new PageUnloadHandler();
};

var createPageUnloadHandlerWithExtentUpdater = function(extentUpdater) {
	return new PageUnloadHandler({
		extentUpdater: extentUpdater
	});
};

describe("A Page Unload Handler", function() {

	it("attempts to push a final map extent when page is unloading", function() {
		var eu = createExtentUpdater(),
			puh = createPageUnloadHandlerWithExtentUpdater(eu);

		spyOn(eu, "push");
		puh.handle();

		expect(eu.push).toHaveBeenCalled();
	});

	it("does not throw an error if extent updater is not provided", function() {
		var puh = createPageUnloadHandler();

		expect(function() {
			puh.handle();
		}).not.toThrow();
	});

});
