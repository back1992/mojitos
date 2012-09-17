
YUI.add("mojito-core-controller", function (Y, NAME) {
	Y.namespace('mojito.controllers')[NAME] = {
		index: function (ac) {
			ac.done("Mojito is working");
		}
    };
});