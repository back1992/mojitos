
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
				instance = {};

			// Create the instance object that will be used for the lifetime of the mojit
			instance.type = sourceInstance.type,
			instance.action = sourceInstance.action,
			instance.contextKey = Y.JSON.stringify([context]),
			instance.instanceKey = sourceInstance.type + sourceInstance.action + instance.contextKey

			// If we have the instance in the cache use that
			if (!cache[instance.cacheKey]) {
				instance.definition = this.getMojitDefinition(sourceInstance.type, context);
				instance.config = this.getMojitConfig(sourceInstance.type, context);
				cache[instance.cacheKey] = instance;
			}

			// Merge the sourceInstance over the cached instance so we override anything required
			mergedInstance = Y.merge(Y.mojito.utils.copy(cache[instance.cacheKey]), Y.mojito.utils.copy(sourceInstance));
			// TODO: only use this when in dev mode
			Y.mojito.utils.deepFreeze(mergedInstance);
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