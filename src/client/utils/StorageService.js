meshmap.namespace("meshmap.utils");

meshmap.utils.StorageService = (function() {

	var StorageService = function() {};

	var getStorageType = function() {
		return "cookies";
	};

	StorageService.prototype.set = function(name, value, expirySeconds) {
		if(getStorageType() === "cookies") {
			setCookie(name, value, expirySeconds);
		}
	};

	StorageService.prototype.get = function(name) {
		if(getStorageType() === "cookies") {
			return getCookie(name);
		}
		return null;
	};

	StorageService.prototype.clear = function(name) {
		if(getStorageType() === "cookies") {
			clearCookie(name);
		}
	};

	var setCookie = function(name, value, expirySeconds) {
		var expires = "";
		if (expirySeconds) {
			var date = new Date();
			date.setTime(date.getTime() + (expirySeconds * 1000));
			expires = "; expires=" + date.toGMTString();
		}

		document.cookie = name + "=" + value + expires + "; path=/";
	};

	var getCookie = function(name) {
		var nameEq = name + "=";
		var ca = document.cookie.split(";");
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			c = c.replace(/^\s+/, "");
			if (c.indexOf(nameEq) === 0) {
				return c.substring(nameEq.length, c.length);
			}
		}
		return null;
	};

	var clearCookie = function(name) {
		setCookie(name, "", -1);
	};

	return StorageService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.StorageService;
}
