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

'use strict';

/*
    Function to extract HTTP meta data from the Mojito meta object
*/

function readMeta(meta, handler) {
    if (!meta || !meta.http) { return; }

    var header;
    for (header in meta.http.headers) {
        if (meta.http.headers.hasOwnProperty(header)) {
            handler.headers[header] = meta.http.headers[header];
        }
    }

    handler.statusCode = meta.http.code;
    handler.reasonPhrase = meta.http.reasonPhrase;
}

/*
    Function to write HTTP headers
*/

function writeHeaders(handler) {

    if (!handler.headersSent) {

        // passing a falsy reason phrase would break, because node uses 
        // every non-string arguments[1] as header object/array
        if (handler.reasonPhrase && typeof handler.reasonPhrase === 'string') {
            handler.res.writeHead(handler.statusCode || 200, handler.reasonPhrase, handler.headers);
        } else {
            handler.res.writeHead(handler.statusCode || 200, handler.headers);
        }

        handler.headersSent = true;
    }
}

/*
    This is the Nodejs to Mojito abstraction object.
*/

var OutputHandler = function (req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.headers = {};
};

OutputHandler.prototype = {

    /*
        The runtime abstraction for res.write();
    */

    send: function (data, meta) {
        readMeta(meta, this);
        writeHeaders(this);
        if (data !== undefined && data !== null) {
            this.res.write(data);
        }
    },

    /*
        The runtime abstraction for res.end();
    */

    done: function (data, meta) {
        this.send(data, meta);
        this.res.end();
    }
};

module.exports = OutputHandler;
