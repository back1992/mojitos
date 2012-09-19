
define("mojito-dispatch", ["mojito-utils", "mojito-store"], function (utils, store) {

	var cache = {};

	return function (command, adapter) {

		store.expandInstance(command.instance, command.context, function (err, instance) {

			// console.log(JSON.stringify(instance, null, 4));

			var amdModules = instance.definition.modules.concat(); // make a copy

			// Force the use of the "mojito-addon-api" as it provides done() & send()
			amdModules.push("mojito-addon-api");

			require.config({
				paths: instance.definition.amd.modules
			});

			require(amdModules, function (ctrl) {

				var api = {},
					pos,
					module;

				for (pos in arguments) {

					module = arguments[pos];

					if (typeof module.attach === "function") {
						module.attach(command, adapter, api);
					}
				}

				ctrl[instance.action](api);
			});
		});
		
	};
});