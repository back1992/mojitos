
YUI.add("mojito-dispatch", function (Y, NAME) {
console.log(NAME);
	Y.namespace("mojito").dispatch = function (command, adapter) {
		adapter.done("Hello world!");
	};

});