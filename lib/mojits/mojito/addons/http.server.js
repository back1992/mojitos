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

define("mojito-addon-http", function (require) {

    var mime = require("mime");

    return function (command, adapter, api) {

        // Make sure we have a meta object
        api.meta = api.meta || {};
        // Make sure we have a http object
        api.meta.http = api.meta.http || {};
        // Then make sure we have a headers object
        api.meta.http.headers = api.meta.http.headers || {};

        api.http = {

            /*
                Set header field to value, or pass an object to set multiple fields at once.
            */

            set: function (key, val) {

                var name,
                    items;

                if (typeof key === "object") {
                    items = key;
                    for (name in items) {
                        if (items.hasOwnProperty(name)) {
                            this.set(name, items[name]);
                        }
                    }

                    return;
                }

                api.meta.http.headers[key] = val;

                return this;
            },

            /*
                Get the case-insensitive response header field.
            */

            get: function (key) {
                return api.meta.http.headers[key];
            },

            /*
                Assign the charset. Defaults to "utf-8".
            */

            charset: function (charset) {
                if (!charset) {
                    charset = "utf-8";
                }
                this.set("charset", charset);
                return this;
            },

            /*
                Sets the Content-Type to the mime lookup of type, or when "/" is present the Content-Type is simply set to this literal value.
            */

            type: function (type) {
                if (type.indexOf("/") < 0) {
                    type = mime.lookup(type);
                }
                this.set("content-type", type);
            },

            /*
                Chainable alias of node's '`res.statusCode=`.
            */

            status: function (code, reason) {
                api.meta.http.code = code;
                if (reason) {
                    api.meta.http.reasonPhrase = reason;
                }
                return this;
            },

            /*
                Join the given links to populate the "Link" response header field.
            */

            links: function (links) {

                var rel,
                    link,
                    send = [];

                for (rel in links) {
                    if (links.hasOwnProperty(rel)) {
                        send.push("<" + links[rel] + ">; rel=\"" + rel + "\"");
                    }
                }

                this.set("link", send.join(", "));

                return this;
            }
        };
    };
});