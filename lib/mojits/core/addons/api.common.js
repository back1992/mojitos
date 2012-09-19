
YUI.add("mojito-addon-api", function (Y) {

	function Addon(command, adapter, api) {
        
        api.done = function (data, meta) {
			this.send(data, meta);
			adapter.done();
		};

		api.send = function (data, meta) {
			adapter.send(data, meta);
		};
    }

    Y.namespace("mojito.addons").api = Addon;
});