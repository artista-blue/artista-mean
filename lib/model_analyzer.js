"use strict";

var fs = require('fs');
var util = require('util');

/**
 * Analyze JSON file
 *
 * 1. read JSON file
 * 2. get first object in array
 * 3. analyze object types
 */
class ModelAnalyzer {

    constructor(fname) {
	this.fname = fname;
    }

    /**
     * analyze JSON file
     */
    analyze (callback) {
	var that = this;
	that.firstObject(function (err, json) {
	    if (err) {
		callback(err); return;
	    }
	    var typesMap = that.analyzeTypes(json);
	    callback(err, typesMap);
	});
    }

    /**
     * recognize object type
     */
    analyzeTypes (json) {
	var keys = Object.keys(json),
	    map = new Map();
	keys.forEach(function (key) {
	    var value = json[key];
	    var type = typeof value;
	    if (type === 'number' || type === 'string' || type === 'boolean') {
		map.set(key, type);
	    } else {
		if (Array.isArray(value)) {
		    map.set(key, 'array');
		} else {
		    map.set(key, 'object');
		}
	    }
	});
	return map;
    }

    /**
     * Get first object of JSON (array) file
     */
    firstObject (callback) {
	var that = this;
	fs.readFile(that.fname, function(err, data) {
	    if (err) {
		callback(err); return;
	    }
	    var array;
	    try {
		array = JSON.parse(data);
	    } catch (e) {
		console.dir(e);
		callback("Malformed JSON: " + that.fname); return;
	    }
	    if (!Array.isArray(array) || array.length <= 0) {
		var msg = "JSON file is needed to be 1 array. and at least one object: ";
		callback(msg + that.fname); return;
	    }
	    callback(err, array[0]);	    
	});
    }
}

module.exports = ModelAnalyzer;
