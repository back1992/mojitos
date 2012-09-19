
define("mojito-addon-composite", function () {

    function AdapterBuffer(buffer, id, callback) {
        this.buffer = buffer;
        this.id = id;
        this.callback = callback;
        this.__meta = [];
    }

    AdapterBuffer.prototype = {

        done: function(data, meta) {
            this.buffer[this.id].meta = meta;
            this.buffer[this.id].data += data;
            this.buffer.__counter__ -= 1;
            if (this.buffer.__counter__ === 0) {
                // TODO: Check why this can be called more than once.
                this.callback();
            }
        },

        send: function(data, meta) {
            this.buffer[this.id].meta = meta;
            this.buffer[this.id].data += data;
        }
    };


	function Addon(command, adapter, api) {
        this.command = command;
        this.adapter = adapter;
    }

    Addon.prototype = {

        execute: function(map, callback) {

            var buffer = {},
                content = {},
                meta = {};

            buffer.__counter__ = Y.Object.size(map);

            this.dispatch(map, this.command, buffer, function() {

                var name;

                // Reference the data we want from the "buffer" into our
                // "content" obj Also merge the meta we collected.
                for (name in buffer) {

                    if (buffer.hasOwnProperty(name) && name !== '__counter__') {

                        content[name] = buffer[name].data || '';

                        if (buffer[name].meta) {
                            meta = Y.mojito.util.metaMerge(meta, buffer[name].meta);
                        }
                    }
                }

                callback(content, meta);
            });
        },

        dispatch: function (map, command, buffer, callback) {

            var name,
                item;

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

    return {
        attach: function (command, adapter, api) {
            api.composite = new Addon(command, adapter, api);
        }
    };
});