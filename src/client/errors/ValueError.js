meshmap.namespace("meshmap.errors");

meshmap.errors.ValueError = (function() {
	var ValueError = function(message) {
		this.name = "ValueError";
		this.message = message || /* istanbul ignore next */ "Variable contains an invalid value";
		this.stack = (new Error()).stack;
	};
	ValueError.prototype = Object.create(Error.prototype);
	ValueError.prototype.constructor = ValueError;

	return ValueError;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.errors.ValueError;
}
