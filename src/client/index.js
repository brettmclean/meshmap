var meshmap = {};

meshmap.namespace = function(ns) {
	if(ns) {
		var parts = ns.split(".");
		var obj = typeof window !== "undefined" ? /* istanbul ignore next */ window : global;
		for(var i = 0; i < parts.length; i++) {
			var part = parts[i];
			if(typeof obj[part] === "undefined") {
				obj[part] = {};
			}
			obj = obj[part];
		}
	}
};

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap;
}
