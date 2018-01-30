var BASE_PATH = "../../../src/server/modules/";

var load = function(path) {
	var fullPath = BASE_PATH + path;
	return require(fullPath);
};

exports.load = load;
