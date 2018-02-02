var fs = require("fs");

var FileWriteService = function() {

};

FileWriteService.prototype.appendUtf8StringToFile = function(filePath, str, callback) {
	callback = callback || function() {};
	fs.appendFile(filePath, str, "utf8", callback);
};

module.exports = FileWriteService;
