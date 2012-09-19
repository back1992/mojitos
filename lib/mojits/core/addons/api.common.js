
define("mojito-addon-api", function () {

    return {
    	attach: function (command, adapter, api) {

	        api.done = function (data, meta) {
				this.send(data, meta);
				adapter.done();
			};

			api.send = function (data, meta) {
				adapter.send(data, meta);
			};
	    }
    };
});