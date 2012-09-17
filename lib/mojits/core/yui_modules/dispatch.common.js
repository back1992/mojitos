
YUI.add("mojito-dispatch", function (Y, NAME) {

	var cache = {},
		store = Y.mojito.store;

	Y.namespace("mojito").dispatch = function (command, adapter) {

		store.expandInstance(command.instance, command.context, function (err, instance) {

			// console.log(JSON.stringify(instance, null, 4));

			var yuiObj,
				yuiConfig,
				yuiModules = instance.definition.modules.concat(); // make a copy

			// If we have a YUI instance for the context use it otherwise make one
			if (cache[instance.instanceKey]) {
				yuiObj = cache[instance.instanceKey];
			} else {
				yuiObj = YUI();

				// Configure this instance of YUI
				yuiConfig = {
	                // lang: command.context.langs,
	                // core: coreYuiModules,
	                modules: instance.definition.yui.modules
	            };

				yuiObj.applyConfig(yuiConfig);
				cache[instance.instanceKey] = yuiObj;

				Y.log("New YUI sandboxed created for: " + instance.instanceKey, "info", NAME);
			}

			// Force the use of the "mojito-addon-api" as it provides done() & flush()
			yuiModules.push("mojito-addon-api");

			// The function to be called in YUI().use();
			yuiModules.push(function (MOJIT_Y) {
				var ctrl,
					api = {}, // use to be ac or action context
					name,
					addon;

				for (name in MOJIT_Y.mojito.addons) {
					addon = new MOJIT_Y.mojito.addons[name](command, adapter, api);
					if (Y.Lang.isFunction(addon.init)) {
						addon.init();
					}
					api[name] = addon;
				}

				ctrl = MOJIT_Y.mojito.controllers[instance.definition.controller][instance.action](api);
			});

			// The YUI Sandbox created for a dispatch call
            yuiObj.use.apply(yuiObj, yuiModules);
		});
		
	};
}, "", {
	requires: [
		"mojito-store"
	]
});