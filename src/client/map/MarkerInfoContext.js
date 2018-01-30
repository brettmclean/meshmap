meshmap.namespace("meshmap.map");

meshmap.map.MarkerInfoContext = (function() {

	// imports
	var observable = MicroEvent.mixin;

	function MarkerInfoContext(marker) {
		this.marker = marker;
		this.layoutIsLarge = false;
		this.userCanEditMarker = false;
	}

	MarkerInfoContext.prototype.deleteMarker = function() {
		if(this.userCanEditMarker) {
			this.trigger("deleteMarkerRequested", this.marker);
		}
	};

	MarkerInfoContext.prototype.editMarker = function() {
		if(this.userCanEditMarker) {
			this.trigger("editMarkerRequested", this.marker);
		}
	};

	observable(MarkerInfoContext.prototype);

	return MarkerInfoContext;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.MarkerInfoContext;
}
