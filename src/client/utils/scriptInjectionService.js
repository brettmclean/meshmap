meshmap.namespace("meshmap.utils");

meshmap.utils.scriptInjectionService = (function() {

	var injectIntoBody = function(scriptUrls, loadCallback) {
		if(!scriptUrls.length) {
			callFunction(loadCallback);
			return;
		}

		var scriptsLoaded = 0;
		var onScriptLoad = function() {
			scriptsLoaded++;
			if(scriptsLoaded >= scriptUrls.length) {
				callFunction(loadCallback);
			}
		};

		for(var i = 0; i < scriptUrls.length; i++) {
			var scriptEl = createScriptElement(scriptUrls[i], onScriptLoad);
			document.body.appendChild(scriptEl);
		}
	};

	var createScriptElement = function(scriptUrl, loadCallback) {
		var scriptEl = document.createElement("script");
		scriptEl.type = "text/javascript";
		scriptEl.async = true;
		scriptEl.src = scriptUrl;

		if(typeof loadCallback === "function") {
			scriptEl.onload = loadCallback;
		}

		return scriptEl;
	};

	var callFunction = function(func) {
		if(typeof func === "function") {
			func();
		}
	};

	return {
		injectIntoBody: injectIntoBody
	};

}());
