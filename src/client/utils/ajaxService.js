meshmap.namespace("meshmap.utils");

meshmap.utils.ajaxService = (function() {

	var get = function(url, successCallback, errorCallback) {
		var request = new XMLHttpRequest();
		request.open("GET", url, true);

		request.onload = function() {
			var success = request.status >= 200 && request.status < 400;
			var callback = success ? successCallback : errorCallback;

			if(typeof callback === "function") {
				callback(request.responseText);
			}
		};

		request.onerror = function() {
			if(typeof errorCallback === "function") {
				errorCallback(request.responseText);
			}
		};

		request.send();
	};

	return {
		get: get
	};

}());
