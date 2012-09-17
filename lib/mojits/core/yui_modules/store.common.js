
YUI.add("mojito-store", function (Y) {

	var cache = {};

	Y.namespace("mojito").store = {

		source: null,

		init: function (config) {
			Y.log("Init'd");
		},

		/*
			command: {
				instance: {
					type: <string>
					action: <string>
				},
				context: <object>
			}
		*/

		expandInstance: function (sourceInstance, context, callback) {

			var mergedInstance,
				instance = {},
				key;

			// This is faster than calling JSON.stringy()
			instance.contextKey = "";
			for (key in context) {
				instance.contextKey += key + context[key];
			}

			// Create the instance object that will be used for the lifetime of the mojit
			instance.type = sourceInstance.type;
			instance.action = sourceInstance.action;

			// Create the cache key for the instance
			instance.instanceKey = instance.type + instance.action + instance.contextKey;

			// If we have the instance in the cache use that
			if (!cache[instance.instanceKey]) {
				instance.definition = this.getMojitDefinition(instance.type, context);
				instance.config = this.getMojitConfig(instance.type, context);
				cache[instance.instanceKey] = instance;
			}

			// Merge the sourceInstance over the cached instance so we override anything required
			// JSON.parse(JSON.stringify()) is faster than Y.mojito.utils.copy() under load.
			// This costs ~10ms @ -n 1000 -c 100 and increases as the object gets bigger
			mergedInstance = Y.merge(JSON.parse(JSON.stringify(cache[instance.instanceKey])), sourceInstance);

			// TODO: only use this when in dev mode
			// This costs ~10ms @ -n 1000 -c 100 and increases as the object gets bigger
			// Y.mojito.utils.deepFreeze(mergedInstance);
			// Return the mergedInstance
			callback(null, mergedInstance);
		},

		getMojitDefinition: function (type, context) {
			return this.source.get("definitions." + type, context);
		},

		getMojitConfig: function (type, context) {
			return {};
		}
	};
}, "", {
	requires: [
		"mojito-utils",
		"json-stringify"
	]
});