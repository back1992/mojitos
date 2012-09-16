
YUI.add("mojito-core-controller", function (Y, NAME) {

	Y.namespace('mojito.controllers')[NAME] = {

        "404": function(ac) {
            ac.done('404');
        }

    };

});