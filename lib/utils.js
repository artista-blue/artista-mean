"use strict";

var fs = require('fs');

var Utils = function () {};

Utils.isFunction = function (obj) {
    if (typeof(obj) == 'function') {
	return true;
    }
    return false;
};


var _fs = function () {};
    
_fs.copyFile = function (src, dst) {
    fs.createReadStream(src).pipe(fs.createWriteStream(dst));
};

_fs.files = function (dirname, suffix) {
    var files;
    files = fs.readdirSync(dirname);
    if (suffix) {
	files = files.filter(function (str) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	});
    }
    return files || [];
};

Utils.fs = _fs;

module.exports = Utils;
