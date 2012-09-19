/*jslint anon:true, sloppy:true, nomen:true, plusplus: true*/

define("master", function () {

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

    for (i = 1; i <= 50; i++) {
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

            ac.use("mojito-addon-composite");

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
