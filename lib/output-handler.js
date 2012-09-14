
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

/**
 * This is an object used as the single pathway for data to leave a mojit
 * action execution. It is used as a component of the ActionContext object,
 * which uses it to call <em>done</em> and <em>flush</em> in order to complete.
 *
 * There are two versions of this object, one for the client, and one for the
 * server. This is the server version, which is more complex than the client
 * version.
 *
 * @class OutputHandler
 * @param {Object} req The Request object.
 * @param {Object} res The Response object.
 * @param {Function} next The next function, which should be invokable.
 * @constructor
 */
var OutputHandler = function(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;
    this.headers = {};
};

OutputHandler.prototype = {

    flush: function(data, meta) {
        readMeta(meta, this);
        writeHeaders(this);
        this.res.write(data);
    },

    done: function(data, meta) {
        this.flush(data, meta);
        this.res.end();
    },

    error: function(err) {
        throw err;
    }
};

module.exports = OutputHandler;
