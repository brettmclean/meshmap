var InMemoryAppCache = require("./InMemoryAppCache");

var singletonInstance = null;

var create = function() {
	if(!singletonInstance) {
		singletonInstance = new InMemoryAppCache();
	}
	return singletonInstance;
};

module.exports.create = create;
