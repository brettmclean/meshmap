var fs = require("fs");

var FileReadService = function() {

};

FileReadService.prototype.readAsUtf8StringSync = function(filePath) {
	return fs.readFileSync(filePath, "utf8");
};

module.exports = FileReadService;
