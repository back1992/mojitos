/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

define('myMojit', ["mojito-utils"], function(utils) {
    return {
        index: function(ac) {
			utils.log('controller index', 'debug');
            ac.done('Mojito is Working.');
        }
    };
});