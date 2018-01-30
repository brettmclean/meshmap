var BASE_PATH = "../../../src/client/";
var DEPS_JSON = "scripts/js-deps/clientJsDeps.json";
var DEFAULT_ROOT_PATH = "meshmap";

var dependencyResolver = require("../../../scripts/js-deps/dependencyResolver");
var jsDeps = dependencyResolver.getJsDeps(DEPS_JSON);
var pathsLoadedIntoGlobal = {};

var load = function(path) {
	ensureDependenciesLoadedIntoGlobal(path);
	var fullPath = BASE_PATH + path;
	return require(fullPath);
};

var ensureDependenciesLoadedIntoGlobal = function(path) {
	var deps = jsDeps[path];
	if(deps) {
		for(var i = 0; i < deps.length; i++) {
			var depPath = deps[i];
			if(!pathsLoadedIntoGlobal[depPath]) {
				loadIntoGlobal(depPath);
			}
		}
	}
};

var ensureNamespaceExists = function(path, rootObj) {
	if(!path) {
		return rootObj;
	}

	var parts = typeof path === "string" ? path.split("/") : [];

	var currObj = rootObj;
	for(var i = 0; i < parts.length; i++) {
		if(typeof currObj[parts[i]] === "undefined") {
			currObj[parts[i]] = {};
		}
		currObj = currObj[parts[i]];
	}

	return currObj;
};

var loadIntoGlobal = function(path, rootPath) {
	rootPath = rootPath || DEFAULT_ROOT_PATH;

	var pathMinusLast = path.substring(0, path.lastIndexOf("/"));

	var currObj = ensureNamespaceExists(rootPath, global);
	currObj = ensureNamespaceExists(pathMinusLast, currObj);

	var lastPart = path.substring(path.lastIndexOf("/") + 1);
	currObj[lastPart] = load(path);

	pathsLoadedIntoGlobal[path] = true;
};

exports.load = load;
