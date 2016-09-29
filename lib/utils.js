"use strict";

var fs = require('fs');

var Utils = function () {};

Utils.isFunction = function (obj) {
    if (typeof(obj) == 'function') {
	return true;
    }
    return false;
};

Utils.iter2arr = function (it) {
    var arr = [];
    for (;;) {
	var n = it.next();
	if (n.done) {
	    break;
	}
	arr.push(n.value);
    }
    return arr;
};

var _fs = function () {};
    
_fs.copyFile = function (src, dst) {
    var data = fs.readFileSync(src);
    fs.writeFileSync(dst, data);
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
