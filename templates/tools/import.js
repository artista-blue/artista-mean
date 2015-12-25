"use strict";

var fs = require('fs');
var path = require('path');

var async = require('async');
var Model = require('./models/models.js');

function readJsonFile(fname, callback) {
    fs.readFile(fname, 'utf8', function (err, data) {
	var json;
	if (!err) {
	    json = JSON.parse(data);
	}
	callback(err, json);
    });
}

function initModels(infile, ModelObject, callback) {
    var array;
    async.waterfall([
	function (cb) {
	    readJsonFile(infile, function (err, arr) {
		array = arr;
		cb(err);
	    });
	},
	function (cb) {
	    ModelObject.remove({}, function (err) {
		if (err) {
		    cb(err);
		} else {
		    cb();
		}
	    });
	},
	function (cb) {
	    async.forEach(array, function (json, next) {
		var model = new ModelObject(json);
		model.save().then(function (doc) {
		    next();
		});
	    }, function (err) {
		cb(err);
	    });
	}
    ], function (err) {
	callback(err);
    });
}

fs.readdir('./json', function (err, files) {
    files = files.filter(function (str) {
	var suffix = ".json";
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
    });
    async.forEach(files, function (file, next) {
	var jsonPath = path.join('json', file),
	    schemaName = file.split('.json')[0];
	initModels(jsonPath, Model[schemaName], function (err) {
	    next(err);
	});
    }, function (err) {
	var exitCode = 0;
	if (err) {
	    console.log(err);
	    exitCode = 1;
	}
	process.exit(exitCode);
    });
});
    
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    process.exit(1);
});

