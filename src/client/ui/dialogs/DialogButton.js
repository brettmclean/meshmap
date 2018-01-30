meshmap.namespace("meshmap.ui.dialogs");

meshmap.ui.dialogs.DialogButton = (function() {

	var DialogButton = function(text, value, callback) {
		this.text = text || null;
		this.value = value || false;
		this.callback = callback || null;
		this.classes = [];
	};

	DialogButton.prototype.click = function() {
		if(typeof this.callback === "function") {
			this.callback(this.value);
		}
	};

	DialogButton.prototype.addClass = function(cls) {
		var clsList = cls.split(/\s+/);
		for(var i = 0; i < clsList.length; i++) {
			this.classes.push(clsList[i]);
		}
		return this;
	};

	return DialogButton;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.dialogs.DialogButton;
}
