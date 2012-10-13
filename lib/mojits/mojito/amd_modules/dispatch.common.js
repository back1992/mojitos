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

define("mojito-dispatch", ["mojito-utils", "mojito-store"], function (utils, store) {

    return function dispatch(command, adapter) {

        /*
            Words
        */

        store.expandInstance(command.instance, command.context, function (err, instance) {

            // console.log(JSON.stringify(instance, null, 4));

            /*
                Words
            */
            require.config({
                paths: instance.definition.amd[utils.runtime()]
            });

            /*
                The adapter object always gets assigned this dispatch function
            */
            adapter.dispatch = dispatch;

            /*
                Words
            */
            require(instance.definition.requires, function (ctrl) {

                var api = {},
                    pos,
                    module;

                /*
                    Words
                */
                for (pos in arguments) {
                    if (arguments.hasOwnProperty(pos)) {
                        module = arguments[pos];
                        if (typeof module === "function") {
                            module(command, adapter, api);
                        }
                    }
                }

                /*
                    Words
                */
                ctrl[instance.action](api);
            });
        });
    };
});