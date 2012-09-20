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

/*globals define: true, window: true*/

/*jslint regexp: true, nomen: true*/

'use strict';

define("mojito-utils", function () {

    return {

        /*
        
        */

        log: function (msg) {
            console.log(msg);
        },

        /*
        
        */

        uuidv4: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /*
        
        */

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

        flatten: function (arr, ret) {

            var len = arr.length,
                i;

            ret = ret || [];

            for (i = 0; i < len; i = i + 1) {
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

        pathRegexp: function (path, keys, sensitive, strict) {
            if (path instanceof RegExp) {
                return path;
            }
            if (Array.isArray(path)) {
                path = '(' + path.join('|') + ')';
            }

            path = path
                .concat(strict ? '' : '/?')
                .replace(/\/\(/g, '(?:/')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function (_, slash, format, key, capture, optional, star) {
                    keys.push({ name: key, optional: !!optional });
                    slash = slash || '';
                    return (optional ? '' : slash)
                        + '(?:'
                        + (optional ? slash : '')
                        + (format || '') + (capture || ((format && '([^/.]+?)') || '([^/]+?)')) + ')'
                        + (optional || '')
                        + (star ? '(/*)?' : '');
                })
                    .replace(/([\/.])/g, '\\$1')
                    .replace(/\*/g, '(.*)');

            return new RegExp('^' + path + '$', sensitive ? '' : 'i');
        },

        /*
            Deep data copy
        */

        copy: function (obj) {
            if (!obj) {
                this.log("No object provided for copying");
                return {};
            }
            return JSON.parse(JSON.stringify(obj));
        },

        /*
        
        */

        deepFreeze: function (o) {

            var prop;

            Object.freeze(o); // First freeze the object.

            for (prop in o) {
                if (o.hasOwnProperty(prop) && typeof o === "object" && !Object.isFrozen(o)) {
                    this.deepFreeze(o[prop]); // Recursively call deepFreeze.
                }

                // if (!o.hasOwnProperty(prop) || !(typeof o === "object") || Object.isFrozen(o)) {
                //     // If the object is on the prototype, not an object, or is already frozen, 
                //     // skip it. Note that this might leave an unfrozen reference somewhere in the
                //     // object if there is an already frozen object containing an unfrozen object.
                //     continue;
                // }

                // this.deepFreeze(o[prop]); // Recursively call deepFreeze.
            }
        },

        /*
            Recursively merge properties of two objects

            TODO: Rewrite this
        */

        merge: function (obj1, obj2) {

            var p;

            for (p in obj2) {
                if (obj2.hasOwnProperty(p)) {
                    try {
                        // Property in destination object set; update its value.
                        if (obj2[p].constructor === Object) {
                            obj1[p] = this.merge(obj1[p], obj2[p]);
                        } else {
                            obj1[p] = obj2[p];
                        }
                    } catch (e) {
                        // Property in destination object not set; create it and set its value.
                        obj1[p] = obj2[p];
                    }
                }
            }

            return obj1;
        }
    };
});
