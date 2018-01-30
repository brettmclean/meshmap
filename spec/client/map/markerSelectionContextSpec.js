require("../testUtils/init");
var loader = require("../testUtils/loader");

var MarkerSelectionContext = loader.load("map/MarkerSelectionContext"),
	symbols = loader.load("map/symbols");

var LAYOUT_LARGE = "large";
var LAYOUT_SMALL = "small";

var MARKER_ICONS = {
	"1": "http://maps.google.com/mapfiles/marker.png",
	"2": "http://maps.google.com/mapfiles/marker_black.png",
	"3": "http://maps.google.com/mapfiles/marker_grey.png"
};

var MARKER_COLORS = {
	"1": "#FF0000",
	"2": "#00FF00",
	"3": "#0000FF"
};

describe("A marker selection context", function() {

	it("implements the observable pattern",
		verifyMethodExists.bind(this, "bind"));

	describe("setLayout method", function() {
		it("exists", verifyMethodExists.bind(this, "setLayout"));

		it("sets its large property to true when provided 'large'", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_LARGE);

			expect(msc.large).toBe(true);
		});

		it("sets its small property to true when provided 'small'", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);

			expect(msc.small).toBe(true);
		});

		it("sets its small property to false when provided 'large'", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_LARGE);

			expect(msc.small).toBe(false);
		});
	});

	describe("toolDrawerIsOpen method", function() {
		it("exists", verifyMethodExists.bind(this, "toolDrawerIsOpen"));

		it("always returns true in large layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_LARGE);

			expect(msc.toolDrawerIsOpen()).toBe(true);
		});

		it("automatically closes when layout is switched to small", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_LARGE);
			msc.setLayout(LAYOUT_SMALL);

			expect(msc.toolDrawerIsOpen()).toBe(false);
		});

		it("automatically opens when layout is switched to large", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.setLayout(LAYOUT_LARGE);

			expect(msc.toolDrawerIsOpen()).toBe(true);
		});
	});

	describe("activeToolHasAvailableOptions method", function() {

		it("exists", verifyMethodExists.bind(this, "activeToolHasAvailableOptions"));

		it("returns false for pan tool", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);

			expect(msc.activeToolHasAvailableOptions()).toBe(false);
		});

		it("returns true for point tool", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POINT);

			expect(msc.activeToolHasAvailableOptions()).toBe(true);
		});

		it("returns true for polyline tool", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POLYLINE);

			expect(msc.activeToolHasAvailableOptions()).toBe(true);
		});

		it("returns true for polygon tool", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POLYGON);

			expect(msc.activeToolHasAvailableOptions()).toBe(true);
		});
	});

	describe("setMarkerIcons method", function() {
		it("exists", verifyMethodExists.bind(this, "setMarkerIcons"));

		it("sets the active point symbol to one of the marker icons provided", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerIcons(MARKER_ICONS);

			var activeIconId = msc.activePointSymbolIcon.iconId;
			var activeIconUrl = msc.activePointSymbolIcon.iconUrl;
			expect(activeIconUrl).toBe(MARKER_ICONS[activeIconId]);
		});

		it("emits a pointSymbolChanged event", function(done) {
			var msc = createMarkerSelectionContext();

			msc.bind("pointSymbolChanged", done);

			msc.setMarkerIcons(MARKER_ICONS);
		});

		it("provides a PointSymbol when it emits a pointSymbolChanged event", function(done) {
			var msc = createMarkerSelectionContext();

			msc.bind("pointSymbolChanged", function(pointSymbol) {
				expect(pointSymbol instanceof symbols.PointSymbol).toBeTruthy();
				done();
			});

			msc.setMarkerIcons(MARKER_ICONS);
		});
	});

	describe("setMarkerColors method", function() {
		it("exists", verifyMethodExists.bind(this, "setMarkerColors"));

		it("sets the active polyline symbol to have a color ID", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);

			var activeLineColorId = msc.activePolylineSymbol.lineColorId;
			expect(MARKER_COLORS.hasOwnProperty(activeLineColorId)).toBeTruthy();
		});

		it("sets the active polyline symbol to have a color string", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);

			var activeLineColor = msc.activePolylineSymbol.lineColor;
			expect(typeof activeLineColor).toBe("string");
		});

		it("provides a PolylineSymbol when it emits a polylineSymbolChanged event", function(done) {
			var msc = createMarkerSelectionContext();

			msc.bind("polylineSymbolChanged", function(polylineSymbol) {
				expect(polylineSymbol instanceof symbols.PolylineSymbol).toBeTruthy();
				done();
			});

			msc.setMarkerColors(MARKER_COLORS);
		});
	});

	describe("selectTool method", function() {
		it("exists", verifyMethodExists.bind(this, "selectTool"));

		it("opens the tool drawer if closed in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.selectTool(msc.TOOL_PAN);

			expect(msc.toolDrawerIsOpen()).toBe(true);
		});

		it("closes the tool drawer if open in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.selectTool(msc.TOOL_PAN);
			msc.selectTool(msc.TOOL_POINT);

			expect(msc.toolDrawerIsOpen()).toBe(false);
		});

		it("hides tool options in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.selectTool(msc.TOOL_PAN);
			msc.selectTool(msc.TOOL_POINT);
			msc.toggleOptionsForActiveTool();
			msc.selectTool(msc.TOOL_POINT);

			expect(msc.pointToolOptionsAreVisible()).toBe(false);
		});
	});

	describe("setActiveTool method", function() {
		it("exists", verifyMethodExists.bind(this, "setActiveTool"));

		it("emits a toolChanged event when a new tool is selected", function(done) {
			var msc = createMarkerSelectionContext();

			msc.bind("toolChanged", function(toolName) {
				expect(toolName).toBe(msc.TOOL_POLYGON);
				done();
			});

			msc.setActiveTool(msc.TOOL_POLYGON);
		});

		it("does not emit a toolChanged event when the current tool is selected again", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POLYGON);
			msc.bind("toolChanged", function(toolName) {
				// jshint unused: false
				fail("toolChanged event should not be fired if tool remains the same");
			});

			msc.setActiveTool(msc.TOOL_POLYGON);
		});

		it("hides tool options when tool changed", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.setActiveTool(msc.TOOL_POLYGON);

			expect(msc.pointToolOptionsAreVisible()).toBe(false);
		});
	});

	describe("panToolIsActive method", function() {
		it("exists", verifyMethodExists.bind(this, "panToolIsActive"));

		it("returns true by default", function() {
			var msc = createMarkerSelectionContext();

			var panToolIsActive = msc.panToolIsActive();

			expect(panToolIsActive).toBe(true);
		});

		it("returns false when another tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POINT);
			var panToolIsActive = msc.panToolIsActive();

			expect(panToolIsActive).toBe(false);
		});

		it("returns true when pan tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POINT);
			msc.setActiveTool(msc.TOOL_PAN);
			var panToolIsActive = msc.panToolIsActive();

			expect(panToolIsActive).toBe(true);
		});
	});

	describe("pointToolIsActive method", function() {
		it("exists", verifyMethodExists.bind(this, "pointToolIsActive"));

		it("returns false when another tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);
			var pointToolIsActive = msc.pointToolIsActive();

			expect(pointToolIsActive).toBe(false);
		});

		it("returns true when point tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);
			msc.setActiveTool(msc.TOOL_POINT);
			var pointToolIsActive = msc.pointToolIsActive();

			expect(pointToolIsActive).toBe(true);
		});
	});

	describe("polylineToolIsActive method", function() {
		it("exists", verifyMethodExists.bind(this, "polylineToolIsActive"));

		it("returns false when another tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);
			var polylineToolIsActive = msc.polylineToolIsActive();

			expect(polylineToolIsActive).toBe(false);
		});

		it("returns true when polyline tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);
			msc.setActiveTool(msc.TOOL_POLYLINE);
			var polylineToolIsActive = msc.polylineToolIsActive();

			expect(polylineToolIsActive).toBe(true);
		});
	});

	describe("polygonToolIsActive method", function() {
		it("exists", verifyMethodExists.bind(this, "polygonToolIsActive"));

		it("returns false when another tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);
			var polygonToolIsActive = msc.polygonToolIsActive();

			expect(polygonToolIsActive).toBe(false);
		});

		it("returns true when polygon tool is selected", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_PAN);
			msc.setActiveTool(msc.TOOL_POLYGON);
			var polygonToolIsActive = msc.polygonToolIsActive();

			expect(polygonToolIsActive).toBe(true);
		});
	});

	describe("toggleOptionsForTool method", function() {

		it("exists", verifyMethodExists.bind(this, "toggleOptionsForTool"));

		it("shows point tool options when called for point tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);

			var pointToolOptionsVisible = msc.pointToolOptionsAreVisible();
			expect(pointToolOptionsVisible).toBe(true);
		});

		it("shows polyline tool options when called for polyline tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYLINE);

			var polylineToolOptionsVisible = msc.polylineToolOptionsAreVisible();
			expect(polylineToolOptionsVisible).toBe(true);
		});

		it("shows polygon tool options when called for polygon tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYGON);

			var polygonToolOptionsVisible = msc.polygonToolOptionsAreVisible();
			expect(polygonToolOptionsVisible).toBe(true);
		});

		it("does not show polyline tool options when called for point tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);

			var polylineToolOptionsVisible = msc.polylineToolOptionsAreVisible();
			expect(polylineToolOptionsVisible).toBe(false);
		});

		it("does not show polygon tool options when called for polyline tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYLINE);

			var polygonToolOptionsVisible = msc.polygonToolOptionsAreVisible();
			expect(polygonToolOptionsVisible).toBe(false);
		});

		it("does not show point tool options when called for polygon tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYGON);

			var pointToolOptionsVisible = msc.pointToolOptionsAreVisible();
			expect(pointToolOptionsVisible).toBe(false);
		});

		it("does not show tool options for two tools at once", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.toggleOptionsForTool(msc.TOOL_POLYLINE);

			var pointToolOptionsVisible = msc.pointToolOptionsAreVisible();
			expect(pointToolOptionsVisible).toBe(false);
		});

		it("sets corresponding tool as active when showing tool options", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);

			var pointToolIsActive = msc.pointToolIsActive();
			expect(pointToolIsActive).toBe(true);
		});

		it("hides tool options when called for tool already showing options", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.toggleOptionsForTool(msc.TOOL_POINT);

			var pointToolOptionsVisible = msc.pointToolOptionsAreVisible();
			expect(pointToolOptionsVisible).toBe(false);
		});
	});

	describe("toggleOptionsForActiveTool method", function() {
		it("exists", verifyMethodExists.bind(this, "toggleOptionsForActiveTool"));

		it("shows tool options for point tool when point tool is active in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.setActiveTool(msc.TOOL_POINT);
			msc.toggleOptionsForActiveTool();

			expect(msc.pointToolOptionsAreVisible()).toBe(true);
		});

		it("shows tool options for polyline tool when polyline tool is active in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.setActiveTool(msc.TOOL_POLYLINE);
			msc.toggleOptionsForActiveTool();

			expect(msc.polylineToolOptionsAreVisible()).toBe(true);
		});

		it("shows tool options for polygon tool when polygon tool is active in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.setActiveTool(msc.TOOL_POLYGON);
			msc.toggleOptionsForActiveTool();

			expect(msc.polygonToolOptionsAreVisible()).toBe(true);
		});

		it("hides tool options when already showing options in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setLayout(LAYOUT_SMALL);
			msc.setActiveTool(msc.TOOL_POINT);
			msc.toggleOptionsForActiveTool();
			msc.toggleOptionsForActiveTool();

			expect(msc.pointToolOptionsAreVisible()).toBe(false);
		});

		it("closes tool drawer if open in small layout", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POINT);
			msc.selectTool(msc.TOOL_POINT);
			msc.toggleOptionsForActiveTool();

			expect(msc.toolDrawerIsOpen()).toBe(false);
		});
	});

	describe("hideToolOptions method", function() {

		it("exists", verifyMethodExists.bind(this, "hideToolOptions"));

		it("hides options for point tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.hideToolOptions();

			var pointToolOptionsVisible = msc.pointToolOptionsAreVisible();
			expect(pointToolOptionsVisible).toBe(false);
		});

		it("hides options for polyline tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYLINE);
			msc.hideToolOptions();

			var polylineToolOptionsVisible = msc.polylineToolOptionsAreVisible();
			expect(polylineToolOptionsVisible).toBe(false);
		});

		it("hides options for polygon tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYGON);
			msc.hideToolOptions();

			var polygonToolOptionsVisible = msc.polygonToolOptionsAreVisible();
			expect(polygonToolOptionsVisible).toBe(false);
		});

		it("does not affect active tool", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.hideToolOptions();

			var pointToolActive = msc.pointToolIsActive();
			expect(pointToolActive).toBe(true);
		});
	});

	describe("toolOptionsAreVisible method", function() {

		it("exists", verifyMethodExists.bind(this, "toolOptionsAreVisible"));

		it("returns false when tool options are not visible", function() {
			var msc = createMarkerSelectionContext();

			msc.setActiveTool(msc.TOOL_POINT);

			expect(msc.toolOptionsAreVisible()).toBe(false);
		});

		it("returns true when point tool options are visible", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);

			expect(msc.toolOptionsAreVisible()).toBe(true);
		});

		it("returns true when polyline tool options are visible", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYLINE);

			expect(msc.toolOptionsAreVisible()).toBe(true);
		});

		it("returns true when polygon tool options are visible", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POLYGON);

			expect(msc.toolOptionsAreVisible()).toBe(true);
		});

		it("returns false after tool options are hidden", function() {
			var msc = createMarkerSelectionContext();

			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.hideToolOptions();

			expect(msc.toolOptionsAreVisible()).toBe(false);
		});
	});

	describe("selectPointIcon method", function() {

		it("exists", verifyMethodExists.bind(this, "selectPointIcon"));

		it("emits pointSymbolChanged event with PointSymbol containing correct iconId when new icon is selected", function(done) {
			var msc = createMarkerSelectionContext();

			msc.setMarkerIcons(MARKER_ICONS);
			var selectedPointIcon = msc.markerIconOptions[1];
			msc.bind("pointSymbolChanged", function(pointSymbol) {
				expect(pointSymbol.iconId).toBe(selectedPointIcon.iconId);
				done();
			});

			msc.selectPointIcon(selectedPointIcon);
		});

		it("does not emit pointSymbolChanged event when selected icon is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerIcons(MARKER_ICONS);
			msc.selectPointIcon(msc.markerIconOptions[1]);
			msc.bind("pointSymbolChanged", function() {
				fail("pointSymbolChanged event should not be fired if selected icon remains the same");
			});

			msc.selectPointIcon(msc.markerIconOptions[1]);
		});

		it("hides tool options when selected icon is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerIcons(MARKER_ICONS);
			msc.toggleOptionsForTool(msc.TOOL_POINT);
			msc.selectPointIcon(msc.markerIconOptions[1]);
			msc.selectPointIcon(msc.markerIconOptions[1]);

			var pointToolOptionsVisible = msc.pointToolOptionsAreVisible();
			expect(pointToolOptionsVisible).toBe(false);
		});
	});

	describe("selectPolylineColor method", function() {

		it("exists", verifyMethodExists.bind(this, "selectPolylineColor"));

		it("emits polylineSymbolChanged event with PolylineSymbol containing correct colorId when new color is selected", function(done) {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			var selectedColor = msc.markerColorOptions[1];
			msc.bind("polylineSymbolChanged", function(polylineSymbol) {
				expect(polylineSymbol.lineColorId).toBe(selectedColor.colorId);
				done();
			});

			msc.selectPolylineColor(selectedColor);
		});

		it("does not emit polylineSymbolChanged event when selected color is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			msc.selectPolylineColor(msc.markerColorOptions[1]);
			msc.bind("polylineSymbolChanged", function() {
				fail("polylineSymbolChanged event should not be fired if selected color remains the same");
			});

			msc.selectPolylineColor(msc.markerColorOptions[1]);
		});

		it("hides tool options when selected color is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			msc.toggleOptionsForTool(msc.TOOL_POLYLINE);
			msc.selectPolylineColor(msc.markerColorOptions[1]);
			msc.selectPolylineColor(msc.markerColorOptions[1]);

			var polylineToolOptionsVisible = msc.polylineToolOptionsAreVisible();
			expect(polylineToolOptionsVisible).toBe(false);
		});

		it("does not change line width when selected color changes", function(done) {
			var msc = createMarkerSelectionContext();
			var lineWidth = 5;

			msc.setMarkerColors(MARKER_COLORS);
			msc.setPolylineWidth(lineWidth);
			msc.bind("polylineSymbolChanged", function(polylineSymbol) {
				expect(polylineSymbol.lineWidth).toBe(lineWidth);
				done();
			});

			msc.selectPolylineColor(msc.markerColorOptions[1]);
		});
	});

	describe("setPolylineWidth method", function() {

		it("exists", verifyMethodExists.bind(this, "setPolylineWidth"));

		it("emits polylineSymbolChanged event with PolylineSymbol containing correct lineWidth when line width is changed", function(done) {
			var msc = createMarkerSelectionContext();
			var lineWidth = 5;

			msc.bind("polylineSymbolChanged", function(polylineSymbol) {
				expect(polylineSymbol.lineWidth).toBe(lineWidth);
				done();
			});

			msc.setPolylineWidth(lineWidth);
		});

		it("converts string values to number values", function(done) {
			var msc = createMarkerSelectionContext();

			msc.bind("polylineSymbolChanged", function(polylineSymbol) {
				expect(polylineSymbol.lineWidth).toBe(5);
				done();
			});

			msc.setPolylineWidth("5");
		});
	});

	describe("selectPolygonLineColor method", function() {

		it("exists", verifyMethodExists.bind(this, "selectPolygonLineColor"));

		it("emits polygonSymbolChanged event with PolygonSymbol containing correct colorId when new color is selected", function(done) {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			var selectedColor = msc.markerColorOptions[1];
			msc.bind("polygonSymbolChanged", function(polygonSymbol) {
				expect(polygonSymbol.lineColorId).toBe(selectedColor.colorId);
				done();
			});

			msc.selectPolygonLineColor(selectedColor);
		});

		it("does not emit polygonSymbolChanged event when selected color is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			msc.selectPolygonLineColor(msc.markerColorOptions[1]);
			msc.bind("polygonSymbolChanged", function() {
				fail("polygonSymbolChanged event should not be fired if selected color remains the same");
			});

			msc.selectPolygonLineColor(msc.markerColorOptions[1]);
		});

		it("hides tool options when selected color is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			msc.toggleOptionsForTool(msc.TOOL_POLYGON);
			msc.selectPolygonLineColor(msc.markerColorOptions[1]);
			msc.selectPolygonLineColor(msc.markerColorOptions[1]);

			var polygonToolOptionsVisible = msc.polygonToolOptionsAreVisible();
			expect(polygonToolOptionsVisible).toBe(false);
		});

		it("does not change line width when selected color changes", function(done) {
			var msc = createMarkerSelectionContext();
			var lineWidth = 5;

			msc.setMarkerColors(MARKER_COLORS);
			msc.setPolygonLineWidth(lineWidth);
			msc.bind("polygonSymbolChanged", function(polygonSymbol) {
				expect(polygonSymbol.lineWidth).toBe(lineWidth);
				done();
			});

			msc.selectPolygonLineColor(msc.markerColorOptions[1]);
		});
	});

	describe("selectPolygonFillColor method", function() {

		it("exists", verifyMethodExists.bind(this, "selectPolygonFillColor"));

		it("emits polygonSymbolChanged event with PolygonSymbol containing correct colorId when new color is selected", function(done) {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			var selectedColor = msc.markerColorOptions[1];
			msc.bind("polygonSymbolChanged", function(polygonSymbol) {
				expect(polygonSymbol.fillColorId).toBe(selectedColor.colorId);
				done();
			});

			msc.selectPolygonFillColor(selectedColor);
		});

		it("does not emit polygonSymbolChanged event when selected color is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			msc.selectPolygonFillColor(msc.markerColorOptions[1]);
			msc.bind("polygonSymbolChanged", function() {
				fail("polygonSymbolChanged event should not be fired if selected color remains the same");
			});

			msc.selectPolygonFillColor(msc.markerColorOptions[1]);
		});

		it("hides tool options when selected color is already active", function() {
			var msc = createMarkerSelectionContext();

			msc.setMarkerColors(MARKER_COLORS);
			msc.toggleOptionsForTool(msc.TOOL_POLYGON);
			msc.selectPolygonFillColor(msc.markerColorOptions[1]);
			msc.selectPolygonFillColor(msc.markerColorOptions[1]);

			var polygonToolOptionsVisible = msc.polygonToolOptionsAreVisible();
			expect(polygonToolOptionsVisible).toBe(false);
		});

		it("does not change line width when selected color changes", function(done) {
			var msc = createMarkerSelectionContext();
			var lineWidth = 5;

			msc.setMarkerColors(MARKER_COLORS);
			msc.setPolygonLineWidth(lineWidth);
			msc.bind("polygonSymbolChanged", function(polygonSymbol) {
				expect(polygonSymbol.lineWidth).toBe(lineWidth);
				done();
			});

			msc.selectPolygonFillColor(msc.markerColorOptions[1]);
		});
	});

	describe("setPolygonLineWidth method", function() {

		it("exists", verifyMethodExists.bind(this, "setPolygonLineWidth"));

		it("emits polygonSymbolChanged event with PolygonSymbol containing correct lineWidth when line width is changed", function(done) {
			var msc = createMarkerSelectionContext();
			var lineWidth = 5;

			msc.bind("polygonSymbolChanged", function(polygonSymbol) {
				expect(polygonSymbol.lineWidth).toBe(lineWidth);
				done();
			});

			msc.setPolygonLineWidth(lineWidth);
		});

		it("converts string values to number values", function(done) {
			var msc = createMarkerSelectionContext();

			msc.bind("polygonSymbolChanged", function(polygonSymbol) {
				expect(polygonSymbol.lineWidth).toBe(5);
				done();
			});

			msc.setPolygonLineWidth("5");
		});
	});
});

function verifyMethodExists(methodName) {
	var msc = createMarkerSelectionContext();
	expect(typeof msc[methodName]).toBe("function");
}

function createMarkerSelectionContext() {
	return new MarkerSelectionContext();
}
