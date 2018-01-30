require("../testUtils/init");
var loader = require("../testUtils/loader");

var EditMarkerContext = loader.load("map/EditMarkerContext"),
	dm = loader.load("model/datamodel"),
	Location = dm.Location,
	PointMarker = dm.PointMarker;

var LOCATION1 = new Location(1, 1);

describe("An edit marker context", function() {

	it("has a finishEdit method", verifyMethodExists.bind(this, "finishEdit"));

	it("emits a editMarkerCompleted event when user is finished editing marker", function(done) {
		var emc = createEditMarkerContext();

		emc.bind("editMarkerCompleted", done);

		emc.finishEdit();
	});

	it("provides a marker when it emits a editMarkerCompleted event", function(done) {
		var marker = createMarker();
		var emc = createEditMarkerContext(marker);

		emc.bind("editMarkerCompleted", function(m) {
			expect(m).toBe(marker);
			done();
		});

		emc.finishEdit();
	});

});

function verifyMethodExists(methodName) {
	var emc = createEditMarkerContext();
	expect(typeof emc[methodName]).toBe("function");
}

function createEditMarkerContext(marker) {
	return new EditMarkerContext(marker);
}

function createMarker() {
	return new PointMarker(6, LOCATION1);
}
