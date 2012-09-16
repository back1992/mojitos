
YUI.add('mojito-addon-params', function(Y, NAME) {

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

    function Addon(command, adapter, api) {
        this.params = command.params;
    }

    Addon.prototype = {
        route: function(key, def) {
            return extract(this.params.route, key, def);
        }
    };

    Y.namespace('mojito.addons').params = Addon;

});