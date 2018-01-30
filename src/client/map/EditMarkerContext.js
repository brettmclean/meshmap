meshmap.namespace("meshmap.map");

meshmap.map.EditMarkerContext = (function() {

	// imports
	var observable = MicroEvent.mixin;

	function EditMarkerContext(marker) {
		this.marker = marker;
	}

	EditMarkerContext.prototype.finishEdit = function() {
		this.trigger("editMarkerCompleted", this.marker);
	};

	observable(EditMarkerContext.prototype);

	return EditMarkerContext;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.EditMarkerContext;
}
