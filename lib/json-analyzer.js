"use strict";

var fs = require('fs');
var util = require('util');

class JSONAnalyzer {

    constructor(fname) {
	this.fname = fname;
    }

    analyze (callback) {
	var that = this;
	that.firstJSON(function (err, json) {
	    var typesMap = that.analyzeTypes(json);
	    callback(err, typesMap);
	});
    }

    analyzeTypes (json) {
	var keys = Object.keys(json),
	    map = {};
	keys.forEach(function (key) {
	    var value = json[key];
	    var type = typeof value;
	    if (type === 'number' || type === 'string' || type === 'boolean') {
		map[key] = type;
	    } else {
		if (util.isArray(value)) {
		    map[key] = 'array';
		} else {
		    map[key] = 'object';
		}
	    }
	});
	return map;
    }
    
    firstJSON (callback) {
	var that = this;
	fs.readFile(that.fname, function(err, data) {
	    if (err) {
		callback(err); return;
	    }
	    var array = JSON.parse(data);
	    if (!util.isArray(array) || array.length <= 0) {
		callback("Malformed JSON: " + that.fname); return;
	    }
	    callback(err, array[0]);	    
	});
    }
}

module.exports = JSONAnalyzer;
