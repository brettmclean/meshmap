require("../testUtils/init");
var loader = require("../testUtils/loader");

var queryStringParser = loader.load("utils/queryStringParser");

var countKeysInObject = function(obj) {
	return Object.keys(obj).length;
};

describe("The Query String Parser", function() {

	it("will throw a TypeError when provided null", function() {
		expect(function() {
			queryStringParser.parse(null);
		}).toThrowError(TypeError);
	});

	it("will return an empty object when provided an empty string", function() {
		var result = queryStringParser.parse("");

		expect(countKeysInObject(result)).toBe(0);
	});

	it("can parse query strings with single name/value pairs", function() {
		var qs = "a=b";

		var result = queryStringParser.parse(qs);

		expect(countKeysInObject(result)).toBe(1);
		expect(result.a).toBe("b");
	});

	it("can parse empty query string values", function() {
		var qs = "a=";

		var result = queryStringParser.parse(qs);

		expect(countKeysInObject(result)).toBe(1);
		expect(result.a).toBe("");
	});

	it("can parse query strings with multiple name/value pairs", function() {
		var qs = "a=b&c=d&e=f";

		var result = queryStringParser.parse(qs);

		expect(countKeysInObject(result)).toBe(3);
		expect(result.a).toBe("b");
		expect(result.c).toBe("d");
		expect(result.e).toBe("f");
	});

	it("will URL decode query string parameter values", function() {
		var qs = "x=Hello%20World&hashtag=%23javascript&htmlAmpersand=%26amp%3B";

		var result = queryStringParser.parse(qs);

		expect(result.x).toBe("Hello World");
		expect(result.hashtag).toBe("#javascript");
		expect(result.htmlAmpersand).toBe("&amp;");
	});
});
