
YUI.add("mojito-addon-composite", function (Y, NAME) {

	function Addon(command, adapter, api) {
        // ...
    }

    Addon.prototype = {
        execute: function(config, callback) {
        	console.log(config);
            callback();
        }
    };

    Y.namespace('mojito.addons').composite = Addon;

});