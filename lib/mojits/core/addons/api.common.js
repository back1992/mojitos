
define("mojito-addon-api", function () {

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

		/*
			Use an addon module with this api

			TODO: FAIL: Currently this uses a callback that is expected to be synchronous!
		*/

		api.use = function () {

			var id,
				count = arguments.length,
				addons = [];

			for (id in arguments) {
				addons.push(arguments[id]);
			}

			require(addons, function () {

				var pos,
					addon;

				for (pos in arguments) {
					addon = arguments[pos];
					if (typeof addon === "function") {
						addon(command, adapter, api);
					}
				}
			});
		}
    };
});