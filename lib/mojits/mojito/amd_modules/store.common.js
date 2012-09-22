// (The MIT License)

// Copyright (c) 2012 Richard S Allinson <rsa@mountainmansoftware.com>

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/*globals define: true*/

'use strict';

define("mojito-store", ["mojito-utils"], function (utils) {

	var cache = {};

	return {

		source: null,

		/*	
			Given a partial Mojit instance it will return the full Mojit instance

				instance: {
					type: <string>
					action: <string>
				},
				context: <object>
		*/

		expandInstance: function (sourceInstance, context, callback) {

			var mergedInstance,
				instance = {},
				key;

			// This is faster than calling JSON.stringy()
			instance.contextKey = "";
			for (key in context) {
				if (context.hasOwnProperty(key)) {
					instance.contextKey += key + context[key];
				}
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
				// console.log(JSON.stringify(instance, null, 4));
				cache[instance.instanceKey] = instance;
			}

			// Merge the sourceInstance over the cached instance so we override anything required
			// JSON.parse(JSON.stringify()) is faster than Y.mojito.utils.copy() under load.
			// This costs ~10ms @ -n 1000 -c 100 and increases as the object gets bigger
			mergedInstance = utils.merge(JSON.parse(JSON.stringify(cache[instance.instanceKey])), sourceInstance);

			// TODO: only use this when in dev mode
			// This costs ~10ms @ -n 1000 -c 100 and increases as the object gets bigger
			// Y.mojito.utils.deepFreeze(mergedInstance);
			// Return the mergedInstance
			callback(null, mergedInstance);
		},

		/*
			Words
		*/

		getMojitDefinition: function (type, context) {
			// Get the definition for the mojit
			var def = utils.copy(this.source.get("definitions." + type, context));
			// Force the use of the "mojito-addon-http" as it provides standard functions
            def.requires.unshift("mojito-addon-http");
            // Force the use of the "mojito-addon-api" as it provides done() & send()
            def.requires.unshift("mojito-addon-api");
            // If there is a controller it must be first in the list (fragile design)
            if (def.controller) {
                def.requires.unshift(def.controller);
            }
            // Finally make sure there is only one of each
            def.requires = utils.unique(def.requires);
            // Remove the assets map as we don't need it
            delete def.assets;
            // console.log(JSON.stringify(def, null, 4));
            return def;
		},

		/*
			Words
		*/

		getMojitConfig: function (type, context) {
			return {};
		}
	};
});
