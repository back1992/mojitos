/*jslint stupid: true*/

'use strict';

/*
    Module libraries.
*/

var fs = require("fs"),
    path = require("path"),
    yaml = require('js-yaml');

/*
    This function will try and read the requested file returning an Object.

    It will also trim ".ext" from the filePath
 */

exports.readConfigSync = function (filePath, type) {

    var file = ['.yml', '.yaml', '.json'],
        raw,
        obj;

    if (path.extname(filePath)) {
        filePath = filePath.slice(0, path.extname(filePath).length * -1);
    }

    if (!type) {
        type = 0;
    }

    try {
        raw = fs.readFileSync(filePath + file[type], 'utf8');
        try {
            if (type === 0 || type === 1) { // yml
                obj = yaml.load(raw);
            } else if (type === 2) { // json
                obj = JSON.parse(raw);
            }
        } catch (parseErr) {
            throw new Error(parseErr);
        }
    } catch (err) {
        if (err.errno !== 34) { // if the error was not "no such file or directory" say something
            console.error("Error reading file: " + filePath + file[type] + "\n" + err);
        }
        if (type < file.length - 1) {
            return exports.readConfigSync(filePath, type + 1);
        }
    }

    return obj;
}

/*
    Returns an array where each key in the given object is an item in the array.
*/
exports.objKeysToArray = function (obj) {

    var key,
        arr = [];

    for (key in obj) {
        arr.push(key);
    }

    return arr;
};

/*
    Deep data copy
*/

exports.copy = function (obj) {
    if (!obj) {
        console.log("No object provided for copying", "info", NAME);
        return {};
    }
    return Y.JSON.parse(Y.JSON.stringify(obj));
};

/*
 * Recursively merge properties of two objects
 * @method mergeRecursive
 * @param {object} dest The destination object.
 * @param {object} src The source object.
 * @param {boolean} typeMatch Only replace if src and dest types are
 *     the same type if true.

   Arrays just a value and are not merged.
 */

exports.mergeRecursive = function(dest, src, typeMatch) {

    var p,
        arr;

    for (p in src) {
        if (src.hasOwnProperty(p)) {
            // Property in destination object set; update its value.
            // TODO: lousy test. Constructor matches don't always work.
            if (src[p] && src[p].constructor === Object) {
                if (!dest[p]) {
                    dest[p] = {};
                }
                dest[p] = exports.mergeRecursive(dest[p], src[p]);
            } else {
                if (dest[p] && typeMatch) {
                    if (typeof dest[p] === typeof src[p]) {
                        dest[p] = src[p];
                    }
                } else if (typeof src[p] !== 'undefined') {
                    // only copy values that are not undefined, null and
                    // falsey values should be copied
                    // for null sources, we only want to copy over
                    // values that are undefined
                    if (src[p] === null) {
                        if (typeof dest[p] === 'undefined') {
                            dest[p] = src[p];
                        }
                    } else {
                        dest[p] = src[p];
                    }
                }
            }
        }
    }

    return dest;
};