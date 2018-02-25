require("../testUtils/init");
var loader = require("../testUtils/loader");

var PageUnloadHandler = loader.load("events/messageHandlers/PageUnloadHandler"),
	ExtentUpdater = loader.load("map/ExtentUpdater");

describe("A Page Unload Handler", function() {

	it("attempts to push a final map extent when page is unloading", function() {
		var eu = createExtentUpdater(),
			puh = createPageUnloadHandler({ extentUpdater: eu });

		puh.handle();

		expect(eu.push).toHaveBeenCalled();
	});

});

function createPageUnloadHandler(deps) {
	deps = deps || {};

	deps.extentUpdater = deps.extentUpdater || createExtentUpdater();

	return new PageUnloadHandler(deps);
}

function createExtentUpdater() {
	var eu = new ExtentUpdater();
	spyOn(eu, "push");
	return eu;
}
