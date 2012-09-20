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
};

/*
    Returns an array where each key in the given object is an item in the array.
*/
exports.objKeysToArray = function (obj) {

    var key,
        arr = [];

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            arr.push(key);
        }
    }

    return arr;
};

/*
    Deep data copy
*/

exports.copy = function (obj) {
    if (!obj) {
        console.log("No object provided for copying");
        return {};
    }
    return JSON.parse(JSON.stringify(obj));
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

exports.mergeRecursive = function (dest, src, typeMatch) {

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

exports.unique = function (array) {

    var i,
        res = [],
        got = {};

    for (i in array) {
        if (array.hasOwnProperty(i) && !got[array[i]]) {
            res.push(array[i]);
            got[array[i]] = true;
        }
    }

    return res;
};