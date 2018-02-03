var fs = require("fs");

var FileWriteService = function() {

};

FileWriteService.prototype.ensureDirectoryExists = function(directoryPath) {
	fs.mkdir(directoryPath, function(err) {
		if(err && err.code !== "EEXIST") {
			throw err;
		}
	});
};

FileWriteService.prototype.appendUtf8StringToFile = function(filePath, str, callback) {
	callback = callback || function() {};
	fs.appendFile(filePath, str, "utf8", callback);
};

module.exports = FileWriteService;
