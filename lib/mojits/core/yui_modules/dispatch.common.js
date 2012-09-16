
YUI.add("mojito-dispatch", function (Y, NAME) {

	var cache = {},
		store = Y.mojito.store;

	Y.namespace("mojito").dispatch = function (command, adapter) {

		store.expandInstance(command.instance, command.context, function (err, instance) {

			// console.log(JSON.stringify(instance, null, 4));

			var yuiObj,
				yuiConfig,
				yuiModules = Y.mojito.utils.copy(instance.definition.modules);

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
			}

			// The function to be called in YUI().use();
			yuiModules.push(function (MOJIT_Y) {
				var ctrl = MOJIT_Y.mojito.controllers[instance.definition.controller][instance.action](adapter);
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