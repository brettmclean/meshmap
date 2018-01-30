require("../testUtils/init");
var loader = require("../testUtils/loader");

var MarkerInfoContext = loader.load("map/MarkerInfoContext"),
	dm = loader.load("model/datamodel"),
	Location = dm.Location,
	PointMarker = dm.PointMarker;

var LOCATION1 = new Location(1, 1);
var MARKER1 = new PointMarker(6, LOCATION1);

describe("A marker info context", function() {

	it("emits a deleteMarkerRequested event if the user is permitted to edit the marker", function(done) {
		var mic = createMarkerInfoContext(MARKER1, true);
		mic.bind("deleteMarkerRequested", done);

		mic.deleteMarker();
	});

	it("does not emit a deleteMarkerRequested event if the user is not permitted to edit the marker", function() {
		var mic = createMarkerInfoContext(MARKER1, false);
		mic.bind("deleteMarkerRequested", function() {
			fail("deleteMarkerRequested event was emitted");
		});

		mic.deleteMarker();
	});

	it("provides a marker when it emits a deleteMarkerRequested event", function(done) {
		var mic = createMarkerInfoContext(MARKER1, true);
		mic.bind("deleteMarkerRequested", function(marker) {
			expect(marker).toBe(MARKER1);
			done();
		});

		mic.deleteMarker();
	});

	it("emits an editMarkerRequested event if the user is permitted to edit the marker", function(done) {
		var mic = createMarkerInfoContext(MARKER1, true);
		mic.bind("editMarkerRequested", done);

		mic.editMarker();
	});

	it("does not emit an editMarkerRequested event if the user is not permitted to edit the marker", function() {
		var mic = createMarkerInfoContext(MARKER1, false);
		mic.bind("editMarkerRequested", function() {
			fail("editMarkerRequested event was emitted");
		});

		mic.editMarker();
	});

	it("provides a marker when it emits an editMarkerRequested event", function(done) {
		var mic = createMarkerInfoContext(MARKER1, true);
		mic.bind("editMarkerRequested", function(marker) {
			expect(marker).toBe(MARKER1);
			done();
		});

		mic.editMarker();
	});

});

function createMarkerInfoContext(marker, userCanEditMarker) {
	var mic = new MarkerInfoContext(marker);
	mic.userCanEditMarker = userCanEditMarker;
	return mic;
}
