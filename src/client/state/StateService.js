meshmap.namespace("meshmap.state");

meshmap.state.StateService = (function() {

	// imports
	var dm = meshmap.models,
		UserInfo = dm.UserInfo,
		Marker = dm.Marker,
		MapExtent = dm.MapExtent,
		SiteSettings = dm.SiteSettings,
		UserSettings = dm.UserSettings;

	var addGetterAndSetter = function(propName, memberName) {
		addSetter(propName, memberName);
		addGetter(propName, memberName);
	};

	var addGetterAndSetterWithTypeValidation = function(propName, memberName, propDisplayName, requiredType) {
		var validationFunc = createValidationFunction(propDisplayName, requiredType);
		addSetterWithValidationFunction(propName, memberName, validationFunc);

		addGetter(propName, memberName);
	};

	var addStringGetterAndSetter = function(propName, memberName, propDisplayName) {
		var validationFunc = createStringValidationFunction(propDisplayName);
		addSetterWithValidationFunction(propName, memberName, validationFunc);

		addGetter(propName, memberName);
	};

	var createValidationFunction = function(parameterName, requiredType) {
		return function(parameterValue) {
			if(!(parameterValue instanceof requiredType)) {
				throw new TypeError(parameterName + " is not of expected type");
			}
		};
	};

	var createStringValidationFunction = function(parameterName) {
		return function(parameterValue) {
			if(typeof parameterValue !== "string") {
				throw new TypeError(parameterName + " must be a String");
			}
		};
	};

	var addNumericGetterAndSetter = function(propName, memberName, propDisplayName) {
		var validationFunc = createNumberValidationFunction(propDisplayName);
		addSetterWithValidationFunction(propName, memberName, validationFunc);

		addGetter(propName, memberName);
	};

	var createNumberValidationFunction = function(parameterName) {
		return function(parameterValue) {
			if(typeof parameterValue !== "number") {
				throw new TypeError(parameterName + " must be a Number");
			}
		};
	};

	var addGetter = function(propName, memberName) {
		StateService.prototype["get" + propName] = function() {
			return this[memberName];
		};
	};

	var addArrayGetter = function(propName, memberName) {
		StateService.prototype["get" + propName + "s"] = function() {
			return shallowCloneArray(this[memberName]);
		};
	};

	var addSetter = function(propName, memberName) {
		StateService.prototype["set" + propName] = function(val) {
			this[memberName] = val;
		};
	};

	var addSetterWithValidationFunction = function(propName, memberName, validationFunc) {
		StateService.prototype["set" + propName] = function(val) {
			validationFunc(val);
			this[memberName] = val;
		};
	};

	var addArraySetter = function(propName, memberName, requiredType) {
		var methodName = "set" + propName + "s";
		StateService.prototype[methodName] = function(val) {
			for(var i = 0; i < val.length; i++) {
				if(!(val[i] instanceof requiredType)) {
					throw new TypeError("Incorrect type at array element " + i + " passed to " + methodName);
				}
			}

			this[memberName] = shallowCloneArray(val);
		};
	};

	var addAdder = function(propName, memberName, requiredType) {
		var methodName = "add" + propName;
		StateService.prototype[methodName] = function(val) {
			if(requiredType && !(val instanceof requiredType)) {
				throw new TypeError("Incorrect type passed to " + methodName);
			}
			if(!findItemById(this[memberName], val)) {
				this[memberName].push(val);
			}
		};
	};

	var addRemover = function(propName, memberName) {
		var methodName = "remove" + propName;
		StateService.prototype[methodName] = function(id) {
			var array = this[memberName];
			for(var i = 0; i < array.length; i++) {
				if(array[i].id === id) {
					var removedItems = array.splice(i, 1);
					return removedItems[0];
				}
			}
		};
	};

	var addStandardArrayMethods = function(propName, memberName, requiredType) {
		addAdder(propName, memberName, requiredType);
		addArrayGetter(propName, memberName);
		addRemover(propName, memberName);
		addArraySetter(propName, memberName, requiredType);
	};

	var shallowCloneArray = function(arr) {
		return arr.slice();
	};

	var findItemById = function(collection, item) {
		for(var i = 0; i < collection.length; i++) {
			var curr = collection[i];
			if(curr.id === item.id) {
				return curr;
			}
		}
		return null;
	};

	var StateService = function() {
		this._siteName = null;
		this._siteDescription = null;
		this._currentUserId = null;
		this._siteOwnerId = null;

		this._userInfos = [];
		this._markers = [];

		this._markerIcons = null;
		this._markerColors = null;
		this._extent = null;
		this._siteSettings = null;
		this._userSettings = null;
	};

	addStringGetterAndSetter("SiteName", "_siteName", "Site name"); // adds getSiteName and setSiteName methods
	addStringGetterAndSetter("SiteDescription", "_siteDescription", "Site description");

	addNumericGetterAndSetter("CurrentUserId", "_currentUserId", "Current user ID");
	addNumericGetterAndSetter("SiteOwnerId", "_siteOwnerId", "Site owner ID");

	addStandardArrayMethods("User", "_userInfos", UserInfo);
	addStandardArrayMethods("Marker", "_markers", Marker);

	addGetterAndSetter("MarkerIcons", "_markerIcons");
	addGetterAndSetter("MarkerColors", "_markerColors");

	addGetterAndSetterWithTypeValidation("Extent", "_extent", "Map Extent", MapExtent);
	addGetterAndSetterWithTypeValidation("SiteSettings", "_siteSettings", "Site Settings", SiteSettings);
	addGetterAndSetterWithTypeValidation("UserSettings", "_userSettings", "User Settings", UserSettings);

	StateService.prototype.updateUser = function(userInfo) {
		var foundUserInfo = findItemById(this._userInfos, userInfo);

		var changedFields = [];
		if(foundUserInfo) {
			if(foundUserInfo.name !== userInfo.name) {
				changedFields.push(new ChangedField("name", foundUserInfo.name, userInfo.name));
				foundUserInfo.name = userInfo.name;
			}
		}
		return new UpdateResults(foundUserInfo, changedFields);
	};

	StateService.prototype.updateMarker = function(marker) {
		var foundMarker = findItemById(this._markers, marker);

		var changedFields = [];
		if(foundMarker) {
			if(foundMarker.name !== marker.name) {
				changedFields.push(new ChangedField("name", foundMarker.name, marker.name));
				foundMarker.name = marker.name;
			}
		}

		return new UpdateResults(foundMarker, changedFields);
	};

	var UpdateResults = function(updatedObj, changedFields) {
		this.updatedObj = updatedObj || null;
		this.changedFields = changedFields || /* istanbul ignore next */ [];
	};

	var ChangedField = function(name, oldValue, newValue) {
		this.name = name;
		this.oldValue = oldValue;
		this.newValue = newValue;
	};

	return StateService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.state.StateService;
}
