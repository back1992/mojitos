
YUI.add("mojito-addon-api", function (Y) {

	function Addon(command, adapter, api) {
        
        api.done = function (data, meta) {
			this.flush(data, meta);
			adapter.done();
		};

		api.flush = function (data, meta) {
			adapter.flush(data, meta);
		};
    }

    Y.namespace("mojito.addons").api = Addon;
});