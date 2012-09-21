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

define("mojito-addon-composite", function () {

    function AdapterBuffer(buffer, id, callback) {
        this.buffer = buffer;
        this.id = id;
        this.callback = callback;
    }

    AdapterBuffer.prototype = {

        done: function (data, meta) {
            this.send(data, meta);
            this.buffer.calledCounter -= 1;
            if (this.buffer.calledCounter === 0) {
                // TODO: Check why this can be called more than once.
                this.callback();
            }
        },

        send: function (data, meta) {
            this.buffer[this.id].meta = meta; // merge here
            this.buffer[this.id].data += data !== undefined ? data : "";
        }
    };

	function Addon(command, adapter, api) {
        this.command = command;
        this.adapter = adapter;
    }

    Addon.prototype = {

        /*
            Executes all Mojits defined in the given map and returns a new map where 
            each <name> has the value returned after the execution of that Mojit.

            map: { 
                <name>: {
                    type: <name>,
                    action: <name>
                },
                ...
            }
        */

        execute: function (map, callback) {

            var buffer = {},
                content = {},
                meta = {},
                item;

            buffer.calledCounter = 0;

            for (item in map) {
                if (map.hasOwnProperty(item)) {
                    buffer.calledCounter += 1;
                }
            }

            this.dispatch(map, this.command, buffer, function () {

                var name;

                // Reference the data we want from the "buffer" into our
                // "content" obj Also merge the meta we collected.
                for (name in buffer) {

                    if (buffer.hasOwnProperty(name) && name !== 'calledCounter') {

                        content[name] = buffer[name].data || '';

                        // if (buffer[name].meta) {
                        //     meta = Y.mojito.util.metaMerge(meta, buffer[name].meta);
                        // }
                    }
                }

                callback(content, meta);
            });
        },

        /*
            Words
        */

        dispatch: function (map, command, buffer, callback) {

            var name,
                item,
                newCommand,
                adapter;

            for (name in map) {
                if (map.hasOwnProperty(name)) {
                    item = map[name];
                    // Create a buffer for the item
                    buffer[name] = {name: name, data: '', meta: {}};

                    // Make a new "command" that works in the context of this composite
                    newCommand = {
                        instance: item,
                        context: command.context,
                        params: item.params || command.params
                    };

                    adapter = new AdapterBuffer(buffer, name, callback);

                    this.adapter.dispatch(newCommand, adapter);
                }
            }
        }
    };

    /*
        Words
    */

    return function (command, adapter, api) {
        api.composite = new Addon(command, adapter, api);
    };
});