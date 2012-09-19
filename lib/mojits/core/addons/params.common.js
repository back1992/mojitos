
define('mojito-addon-params', function() {

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

    return {
        attach: function (command, adapter, api) {
            api.params = new Addon(command, adapter, api);
        }
    };
});