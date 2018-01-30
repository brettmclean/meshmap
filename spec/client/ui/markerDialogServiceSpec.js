require("../testUtils/init");
var loader = require("../testUtils/loader");

var MarkerDialogService = loader.load("ui/MarkerDialogService"),
	DialogService = loader.load("ui/DialogService"),
	ConfirmDialog = loader.load("ui/dialogs/ConfirmDialog"),
	ViewDialog = loader.load("ui/dialogs/ViewDialog"),
	EditMarkerContext = loader.load("map/EditMarkerContext"),
	MarkerInfoContext = loader.load("map/MarkerInfoContext"),
	dm = loader.load("model/datamodel"),
	Location = dm.Location,
	PointMarker = dm.PointMarker;

var LOCATION1 = new Location(1, 1);
var MARKER1 = new PointMarker(6, LOCATION1);

describe("A marker dialog service", function() {

	it("has a showConfirmDeletionDialog method", verifyMethodExists.bind(this, "showConfirmDeletionDialog"));

	it("has a showEditMarkerDialog method", verifyMethodExists.bind(this, "showEditMarkerDialog"));

	it("has a showMarkerInfoDialog method", verifyMethodExists.bind(this, "showMarkerInfoDialog"));

	it("has a dismissMarkerInfoDialog method", verifyMethodExists.bind(this, "dismissMarkerInfoDialog"));

	describe("showConfirmDeletionDialog method", function() {

		it("throws a TypeError if called without providing a DialogService dependency", function() {
			var mds = new MarkerDialogService();

			expect(function() {
				mds.showConfirmDeletionDialog(MARKER1);
			}).toThrowError(TypeError);
		});

		it("calls showDialog on DialogService and provides ConfirmDialog", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showConfirmDeletionDialog(MARKER1);

			expect(dialogService.showDialog).toHaveBeenCalledWith(jasmine.any(ConfirmDialog));
		});

		it("includes provide marker's name in dialog text", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				}),
				markerName = "Unique marker #384743",
				marker = new PointMarker(6, LOCATION1);
			marker.name = markerName;
			spyOn(dialogService, "showDialog");

			mds.showConfirmDeletionDialog(marker);

			var confirmDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			expect(confirmDialog.message).toContain(markerName);
		});

		it("calls provided callback function when user confirms deletion", function(done) {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showConfirmDeletionDialog(MARKER1, done);
			var confirmDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			confirmDialog.accept();
		});

	});

	describe("showEditMarkerDialog method", function() {
		it("throws a TypeError if called without providing a DialogService dependency", function() {
			var mds = new MarkerDialogService();

			expect(function() {
				mds.showEditMarkerDialog(MARKER1);
			}).toThrowError(TypeError);
		});

		it("calls showDialog on DialogService and provides ViewDialog", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showEditMarkerDialog(MARKER1);

			expect(dialogService.showDialog).toHaveBeenCalledWith(jasmine.any(ViewDialog));
		});

		it("calls showDialog on DialogService and provides EditMarkerContext as ViewDialog scope", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showEditMarkerDialog(MARKER1);

			var viewDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			expect(viewDialog.view.scope).toEqual(jasmine.any(EditMarkerContext));
		});

		it("calls showDialog on DialogService and passes provided marker via EditMarkerContext", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showEditMarkerDialog(MARKER1);

			var viewDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			var editMarkerContext = viewDialog.view.scope;
			expect(editMarkerContext.marker).toBe(MARKER1);
		});

		it("calls provided callback function when user finishes edit", function(done) {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showEditMarkerDialog(MARKER1, done);
			var viewDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			var doneButton = viewDialog.buttons[0];
			doneButton.click();
		});
	});

	describe("showMarkerInfoDialog method", function() {

		it("throws a TypeError if called without providing a DialogService dependency", function() {
			var mds = new MarkerDialogService();

			expect(function() {
				mds.showMarkerInfoDialog(MARKER1);
			}).toThrowError(TypeError);
		});

		it("calls showDialog on DialogService and provides ViewDialog", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "showDialog");

			mds.showMarkerInfoDialog(createMarkerInfoContext(MARKER1));

			expect(dialogService.showDialog).toHaveBeenCalledWith(jasmine.any(ViewDialog));
		});

		it("calls showDialog on DialogService and passes provided MarkerInfoContext as ViewDialog scope", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				}),
				markerInfoContext = createMarkerInfoContext(MARKER1);
			spyOn(dialogService, "showDialog");

			mds.showMarkerInfoDialog(markerInfoContext);

			var viewDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			expect(viewDialog.view.scope).toBe(markerInfoContext);
		});

	});

	describe("dismissMarkerInfoDialog method", function() {

		it("passes most recent marker info dialog handle to dismissDialog on DialogService", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				}),
				markerInfoContext = createMarkerInfoContext(MARKER1);
			spyOn(dialogService, "showDialog");
			spyOn(dialogService, "dismissDialog");

			mds.showMarkerInfoDialog(markerInfoContext);
			mds.dismissMarkerInfoDialog();

			var viewDialog = getFirstArgOfFirstCall(dialogService.showDialog);
			var expectedDialogHandle = viewDialog.handle;

			var actualDialogHandle = getFirstArgOfFirstCall(dialogService.dismissDialog);

			expect(actualDialogHandle).toBe(expectedDialogHandle);
		});

		it("does not call dismissDialog on DialogService if marker info dialog has not been shown", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				});
			spyOn(dialogService, "dismissDialog");

			mds.dismissMarkerInfoDialog();

			expect(dialogService.dismissDialog).not.toHaveBeenCalled();
		});

		it("does not call dismissDialog on DialogService multiple times if called multiple times in a row", function() {
			var dialogService = new DialogService(),
				mds = new MarkerDialogService({
					dialogService: dialogService
				}),
				markerInfoContext = createMarkerInfoContext(MARKER1);
			spyOn(dialogService, "showDialog");
			spyOn(dialogService, "dismissDialog");

			mds.showMarkerInfoDialog(markerInfoContext);
			mds.dismissMarkerInfoDialog();
			mds.dismissMarkerInfoDialog();

			expect(dialogService.dismissDialog.calls.count()).toBe(1);
		});

	});

});

function verifyMethodExists(methodName) {
	var mds = createMarkerDialogService();
	expect(typeof mds[methodName]).toBe("function");
}

function getFirstArgOfFirstCall(spy) {
	var firstCall = spy.calls.first();
	return firstCall.args[0];
}

function createMarkerDialogService() {
	return new MarkerDialogService();
}

function createMarkerInfoContext(marker) {
	return new MarkerInfoContext(marker);
}
