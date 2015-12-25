"use strict";

var fs = require('fs');

var Utils = function () {};

var _fs = function () {};
    
_fs.copyFile = function (src, dst) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
};

Utils.fs = _fs;

module.exports = Utils;
