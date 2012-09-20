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

/*global define: true*/

"use strict";

define("master", ["mojito-addon-composite"], function () {

    var map = {},
        microtime,
        now,
        i;

    try {
        microtime = require("microtime");
        now = microtime.now;
    } catch (e) {
        now = Date.now;
    }

    for (i = 1; i <= 50; i = i + 1) {
        map["slot-" + i] = {
            id: "slot-" + i,
            type: "dummy",
            action: "index",
            config: {
                foo: i
            }
        };
    }

    return {

        index: function (ac) {

            // ac.done("d");return;
            // var duration = 0,
            //     start;

            // Y.each(Y.mojito.controllers, function (c) {
            //     var f = c.index;
            //     if (f) {
            //         c.index = function (ac) {
            //             var start = now();
            //             f.call(c, ac);
            //             duration += (now() - start);
            //         };
            //     }
            // });

            // start = now();

            ac.composite.execute(map, function (data, meta) {

                ac.done(JSON.stringify(data, null, 4), meta);

                // var total = now() - start;

                // console.log("============================================================================");
                // console.log("Overall time: " + (microtime ? total / 1000 : total) + " msec");
                // if (duration > 0) {
                //     console.log("Time spent in our code: " + (microtime ? duration / 1000 : duration) + " msec [" + Math.round((100 * duration) / total) + "%]");
                // } else {
                //     console.log("Execute the app a second time to see how much time was spent in the app code");
                // }
                // console.log("============================================================================");
            });
        }
    };
});
