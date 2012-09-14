/*jslint nomen: true, stupid: true*/

"use strict";

var program = require('commander'),
    path = require('path'),
    fs = require('fs'),
    commandsDir = path.join(__dirname, 'commands');

// Set the version
program.version('0.0.0');
program.option("-v, --verbose", "runtime info");

// Add all the local commands
fs.readdirSync(commandsDir).forEach(function (filename) {
    if (!/\.js$/.test(filename)) {
        return;
    }
    require(path.join(commandsDir, filename));
});

// If we have no arguments show the help
if (process.argv.length <= 2) {
    process.argv.push('--help');
}

program.parse(process.argv);