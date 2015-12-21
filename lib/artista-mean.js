"use strict";

var fs = require('fs');
var path = require('path');

var async = require('async');

var JSONAnalyzer = require('./json-analyzer');

var ArtistaMean = function (projectName, jsonDir) {
    this.projectName = projectName;
    this.jsonDir = jsonDir;
};

ArtistaMean.prototype = {

    generate: function () {
	var that = this;
	that.prepare();
	that.write();
    },

    prepare: function () {
	var that = this;
	async.waterfall([
	    function (cb) {
		that.prepareModels(function (err, modelData) {
		    cb(err, modelData);
		});
	    },
	    function (modelData, cb) {
		console.log(modelData);
		cb();
	    }
	], function (err) {
	    
	});
    },

    prepareModels: function (callback) {
	var that = this;
	var files = fs.readdirSync(that.jsonDir).map(function (f) {
	    return path.join(that.jsonDir, f);
	});
	var list = [];
	async.forEachSeries(files, function (fileName, next) {
	    var analyzer = new JSONAnalyzer(fileName);
	    var modelName = fileName.split(".")[0];
	    analyzer.analyze(function (err, typesMap) {
		list.push([modelName, typesMap]);
		next(err);
	    });
	}, function (err) {
	    callback(err, list);
	});
    },

    write: function () {
	
    }
};

module.exports = ArtistaMean;
