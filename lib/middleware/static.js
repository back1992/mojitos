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

/*!
 * Connect - static
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

"use strict";

var send = require('send');

module.exports = function (app, config) {

    // console.log(config.assets);

    config = config || {};

    if (!config.assets) {
        return function (req, res, next) {
            next();
        };
    }

    function staticAssets(req, res, next) {

        if (('GET' !== req.method && 'HEAD' !== req.method) || !config.assets[req.url]) {
            next();
            return;
        }

        var assetPath = config.assets[req.url];

        function error(err) {
            if (404 === err.status) {
                next();
                return;
            }
            next(err);
        }

        send(req, assetPath)
            .maxage(config.maxAge || 0)
            .hidden(config.hidden)
            .on('error', error)
            .pipe(res);
    }

    app.use(staticAssets);
};
