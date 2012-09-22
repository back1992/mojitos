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

define('mojito-addon-params', function () {

    /*
        Words
    */

    function extract(bag, key, def) {
        if (!key) {
            return bag || {};
        }

        var keys = key.split('.'),
            cur = bag,
            i;

        for (i = 0; i < keys.length; i += 1) {
            if (cur.hasOwnProperty(keys[i])) {
                cur = cur[keys[i]];
            } else {
                return def;
            }
        }

        return cur;
    }

    /*
        Words
    */

    function Addon(command, adapter, api) {
        this.inputs = command.inputs;
    }

    Addon.prototype = {

        /*
            Return the value of param name when present.

            Lookup is performed in the following order:

                route
                body
                query
        */

        get: function (name, def) {
            var val;
            val = this.route(name);
            if (val) {
                return val;
            }
            val = this.body(name);
            if (val) {
                return val;
            }
            val = this.query(name);
            if (val) {
                return val;
            }
            return def;
        },

        /*
            This property is an array containing properties mapped to the named route "parameters". 
            For example if you have the route /user/:name, then the "name" property is 
            available to you as req.params.name. This object defaults to {}.
        */

        route: function (name, def) {
            return extract(this.inputs.params, name, def);
        },

        /*
            This property is an object containing the parsed query-string, defaulting to {}.
        */

        query: function (name, def) {
            return extract(this.inputs.query, name, def);
        },

        /*
            This property is an object containing the parsed request body. 
            This feature is provided by the bodyParser() middleware, though other 
            body parsing middleware may follow this convention as well. 
            This property defaults to {} when bodyParser() is used.
        */

        body: function (name, def) {
            return extract(this.inputs.body, name, def);
        },

        /*
            This property is an object of the files uploaded. 
            This feature is provided by the bodyParser() middleware, though other body 
            parsing middleware may follow this convention as well. 
            This property defaults to {} when bodyParser() is used.
        */

        files: function (name, def) {
            return this.inputs.files[name] || def;
        }
    };

    /*
        Words
    */

    return function (command, adapter, api) {
        api.params = new Addon(command, adapter, api);
    };
});