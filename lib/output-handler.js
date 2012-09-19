
/*jslint anon:true, sloppy:true, nomen:true*/

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

function writeHeaders(handler) {
    if (!handler.headersSent) {

        // passing a falsy reason phrase would break, because node uses every non-string arguments[1]
        // as header object/array
        if (handler.reasonPhrase && typeof handler.reasonPhrase === 'string') {
            handler.res.writeHead(handler.statusCode || 200, handler.reasonPhrase, handler.headers);
        } else {
            handler.res.writeHead(handler.statusCode || 200, handler.headers);
        }

        handler.headersSent = true;
    }
}

var OutputHandler = function(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.headers = {};
};

OutputHandler.prototype = {

    send: function(data, meta) {
        readMeta(meta, this);
        writeHeaders(this);
        if (data !== undefined) {
            this.res.write(data);
        }
    },

    done: function(data, meta) {
        this.send(data, meta);
        this.res.end();
    }
};

module.exports = OutputHandler;
