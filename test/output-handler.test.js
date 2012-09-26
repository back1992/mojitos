
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["assert", "../lib/output-handler"], function (assert, Handler) {

    describe("output-handler", function () {
        it("should be a function", function () {
            assert.equal("function", typeof Handler);
        });

        it("should be a object", function () {
            assert.equal("object", typeof new Handler());
        });

        it("should return a function from send", function () {
            assert.equal("function", typeof new Handler().send);
        });
    });

    describe("output-handler function done", function () {

        var res = {
                writeHead: function () {
                    this.cWriteHead = arguments;
                },
                write: function (data) {
                    this.cWrite = data;
                },
                end: function (data) {
                    this.cEnd = data;
                },
                clean: function () {
                    this.cWriteHead = null;
                    this.cWrite = null;
                    this.cEnd = null;
                }
            };

        it("should return a function", function () {
            assert.equal(typeof new Handler().done, "function");
        });

        it("should result in the text done", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done");

            assert.equal(200, res.cWriteHead[0]);
            assert.equal("done", res.cWrite);
            assert.equal(undefined, res.cEnd);
            assert.equal(true, handler.headersSent);
        });

        it("should result in the http header text/plain", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {headers: ["text/plain"]}});

            assert.equal("text/plain", res.cWriteHead[1]["0"]);
            assert.equal("done", res.cWrite);
            assert.equal(undefined, res.cEnd);
            assert.equal(true, handler.headersSent);
        });

        it("should result in the http header test-test", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {reasonPhrase: "test-test"}});

            assert.equal("test-test", res.cWriteHead[1]);
            assert.equal("done", res.cWrite);
            assert.equal(undefined, res.cEnd);
            assert.equal(true, handler.headersSent);
        });

        it("should result in the http header 404", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {code: 404}});

            assert.equal(404, res.cWriteHead[0]);
            assert.equal("done", res.cWrite);
            assert.equal(undefined, res.cEnd);
            assert.equal(true, handler.headersSent);
        });

        it("should result in the http header 404 test-test text/plain", function () {

            var handler,
                req = {},
                next = function (){};

            res.clean();

            handler = new Handler(req, res, next);

            handler.done("done", {http: {code: 404, reasonPhrase: "test-test", headers: ["text/plain"]}});

            assert.equal(404, res.cWriteHead[0]);
            assert.equal("test-test", res.cWriteHead[1]);
            assert.equal("text/plain", res.cWriteHead[2]["0"]);
            assert.equal("done", res.cWrite);
            assert.equal(undefined, res.cEnd);
            assert.equal(true, handler.headersSent);
        });
    });
});
