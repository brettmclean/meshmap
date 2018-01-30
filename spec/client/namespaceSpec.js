require("./testUtils/init");

var namespace = global.meshmap.namespace;

describe("The namespace function", function() {

	it("can create a namespace with several components", function() {
		namespace("nsTest.one.two.three");
		expect(global.nsTest).toBeDefined();
		expect(global.nsTest.one).toBeDefined();
		expect(global.nsTest.one.two).toBeDefined();
		expect(global.nsTest.one.two.three).toBeDefined();

		delete global.nsTest.one;
		expect(global.nsTest.one).not.toBeDefined();
	});

	it("will not wipe out existing namespace components", function() {
		global.nsTest = {
			one: {
				two: {}
			}
		};
		namespace("nsTest.one.foo");

		expect(global.nsTest.one.two).toBeDefined();
		expect(global.nsTest.one.foo).toBeDefined();

		delete global.nsTest.one;
		expect(global.nsTest.one).not.toBeDefined();
	});

	it("does not throw an error when provided with a falsy value", function() {
		expect(function() {
			namespace();
			namespace(false);
			namespace("");
			namespace(0);
		}).not.toThrow();
	});

});
