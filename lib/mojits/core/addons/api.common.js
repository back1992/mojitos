
define("mojito-addon-api", function () {

    return {
    	attach: function (command, adapter, api) {

	        api.done = function (data, meta) {
				this.flush(data, meta);
				adapter.done();
			};

			api.flush = function (data, meta) {
				adapter.flush(data, meta);
			};
	    }
    };
});