
define("mojito-addon-api", function (require) {

    return function (command, adapter, api) {

		/*
			Send data & or meta then close the connection
		*/

        api.done = function (data, meta) {
			this.send(data, meta);
			adapter.done();
		};

		/*
			Send data & or meta
		*/

		api.send = function (data, meta) {
			adapter.send(data, meta);
		};
    };
});