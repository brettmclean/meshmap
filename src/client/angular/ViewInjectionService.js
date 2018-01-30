meshmap.namespace("meshmap.angular");

meshmap.angular.ViewInjectionService = (function() {

	function ViewInjectionService(angular, requireDigest) {
		this._ng = angular;
		this._requireDigest = requireDigest !== undefined ? requireDigest : true;
	}

	ViewInjectionService.prototype.injectAndCreate = function(containerEl, controllerName, partialUrl, context) {
		var viewEl = this._createAndInjectView(containerEl, controllerName, partialUrl);
		this._compileViewElementWithContext(viewEl, context);
	};

	ViewInjectionService.prototype._createAndInjectView = function(containerEl, controllerName, partialUrl) {
		var viewEl = this._createViewElement(controllerName, partialUrl);
		containerEl.appendChild(viewEl);

		return viewEl;
	};

	ViewInjectionService.prototype._createViewElement = function(controllerName, partialUrl) {
		var div = document.createElement("div");
		div.setAttribute("ng-controller", controllerName);
		div.setAttribute("ng-include", "'" + partialUrl + "'");

		return div;
	};

	ViewInjectionService.prototype._compileViewElementWithContext = function(viewEl, context) {
		var requireDigest = this._requireDigest;
		var injector = this._getAngularInjector();
		var scope = this._createAngularScopeForElementAndContext(viewEl, context);
		injector.invoke([
			"$compile",
			function($compile) {
				$compile(viewEl)(scope);

				if(requireDigest) {
					scope.$digest();
				}
			}
		]);
	};

	ViewInjectionService.prototype._getAngularInjector = function() {
		return this._ng.element(document.body).injector();
	};

	ViewInjectionService.prototype._createAngularScopeForElementAndContext = function(el, context) {
		var scope = this._ng.element(el).scope().$new();
		scope.ctx = context;
		return scope;
	};

	return ViewInjectionService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.angular.ViewInjectionService;
}
