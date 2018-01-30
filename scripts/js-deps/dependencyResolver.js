var fs = require("fs");

var fileList = [];

var flattenToFileList = function(depsFile) {

	fileList = [];

	var jsDeps = getJsDeps(depsFile);

	for(var filePath in jsDeps) {
		addDependencies(jsDeps, filePath);
	}

	return fileList;
};

var addDependencies = function(jsDeps, filePath) {
	if(!jsDeps[filePath] || jsDeps[filePath].length === 0) {
		addToFileList(filePath);
		return;
	}

	var deps = jsDeps[filePath];
	for(var i = 0; i < deps.length; i++) {
		addDependencies(jsDeps, deps[i]);
	}
	addToFileList(filePath);
};

var addToFileList = function(filePath) {
	if(fileList.indexOf(filePath) === -1) {
		fileList.push(filePath);
	}
};

var getJsDeps = function(depsFile) {
	return JSON.parse(fs.readFileSync(depsFile));
};

module.exports = {
	getJsDeps: getJsDeps,
	flattenToFileList: flattenToFileList
};
