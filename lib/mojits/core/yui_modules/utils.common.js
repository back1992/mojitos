YUI.add("mojito-utils", function (Y) {

	Y.namespace("mojito").utils = {

        uuidv4: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        runtime: function (check) {
            // Simple test to see if we are on the client
            var runtime = typeof window === "undefined" ? "server" : "client";

            if (!check) {
                return runtime;
            }

            return check === runtime;
        },

        /**
         * Flatten the given `arr`.
         *
         * @param {Array} arr
         * @return {Array}
         * @api private
         */

        flatten: function(arr, ret){
          var ret = ret || []
            , len = arr.length;
          for (var i = 0; i < len; ++i) {
            if (Array.isArray(arr[i])) {
              exports.flatten(arr[i], ret);
            } else {
              ret.push(arr[i]);
            }
          }
          return ret;
        },

        /**
         * Normalize the given path string,
         * returning a regular expression.
         *
         * An empty array should be passed,
         * which will contain the placeholder
         * key names. For example "/user/:id" will
         * then contain ["id"].
         *
         * @param  {String|RegExp|Array} path
         * @param  {Array} keys
         * @param  {Boolean} sensitive
         * @param  {Boolean} strict
         * @return {RegExp}
         * @api private
         */

        pathRegexp: function(path, keys, sensitive, strict) {
          if (path instanceof RegExp) return path;
          if (Array.isArray(path)) path = '(' + path.join('|') + ')';
          path = path
            .concat(strict ? '' : '/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
              keys.push({ name: key, optional: !! optional });
              slash = slash || '';
              return ''
                + (optional ? '' : slash)
                + '(?:'
                + (optional ? slash : '')
                + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
                + (optional || '')
                + (star ? '(/*)?' : '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)');
          return new RegExp('^' + path + '$', sensitive ? '' : 'i');
        }
    };
});