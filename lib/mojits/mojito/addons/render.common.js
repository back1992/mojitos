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

/*global define: true*/

"use strict";

define("mojito-addon-render", function () {

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

        api.render = {

            tmpl: function (data, module, name, callback) {
                require([module], function (tmpls) {
                    require([tmpls[name].engine], function (engine) {
                        var template = engine.compile(tmpls[name].tmpl),
                            output = template(data);
                        callback(output);
                    });
                });
            },

            json: function (data, callback) {
                try {
                    callback(JSON.stringify(data));
                } catch (err) {
                    throw new Error('Expected JSON data, but there was a parse error');
                }
            },

            xml: function (data, callback) {
                try {
                    callback(simpleXml(data, 'xml'));
                } catch (err) {
                    throw new Error('Expected XML data, but there was a parse error');
                }
            }
        };
    };
});