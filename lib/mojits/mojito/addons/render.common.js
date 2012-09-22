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

"use strict";

define("mojito-addon-render", function () {

    var cache = {};

    // A dirty XML function I found on the interwebs
    function simpleXml(js, wraptag) {
        if (js instanceof Object) {
            return simpleXml(Object.keys(js).map(function (key) {
                return simpleXml(js[key], key);
            }).join('\n'), wraptag);
        } else {
            return ((wraptag) ? '<' + wraptag + '>' : '') + js +
                ((wraptag) ? '</' + wraptag + '>' : '');
        }
    }

    /*
        Words
    */

    return function (command, adapter, api) {

        function json(data, callback) {
            try {
                var output = JSON.stringify(data);
                if (callback) {
                    callback(output);
                } else {
                    adapter.done(output);
                }
            } catch (err) {
                console.log(err);
                throw new Error('Expected JSON data, but there was a parse error');
            }
        }

        function xml(data, callback) {
            try {
                var output = simpleXml(data, 'xml');
                if (callback) {
                    callback(output);
                } else {
                    adapter.done(output);
                }
            } catch (err) {
                throw new Error('Expected XML data, but there was a parse error');
            }
        }
        
        api.render = function (data, module, name, callback) {

            /*
                TODO: This can be done better
            */
            if (module === "json" || module === "xml") {
                callback = name;
                name = null;
                if (module === "json") {
                    if (api.http) {
                        api.http.type("json");
                    }
                    json(data, callback);
                } else {
                    if (api.http) {
                        api.http.type("xml");
                    }
                    xml(data, callback);
                }
                return;
            }

            /*
                We were asked to look into a module so lets load it
            */
            require([module], function (tmpls) {
                require([tmpls[name].engine], function (engine) {
                    var template,
                        output,
                        cacheKey = module + name;

                    if (!cache[cacheKey]) {
                        cache[cacheKey] = engine.compile(tmpls[name].tmpl);
                    }

                    output = cache[cacheKey](data);

                    if (callback) {
                        callback(output);
                    } else {
                        adapter.done(output, api.meta);
                    }
                });
            });
        };
    };
});