"use strict";

var fs = require('fs');
var path = require('path');

var async = require('async');

var JSONAnalyzer = require('./json-analyzer');
var MongooseUtils = require('./mongoose_utils');
var AngularJSGenerator = require('./angularjs-generator');
var ExpressGenerator = require('./express-generator');
var ExpressInitializer = require('./express-initializer');
var Utils = require('./utils');

var ArtistaMean = function (projectPath, jsonDir) {
    this.projectPath = projectPath;
    this.projectName = path.basename(projectPath);
    this.jsonDir = jsonDir;
};

ArtistaMean.prototype = {

    generate: function () {
	var that = this,
	    modelList;
	async.waterfall([
	    function initExpress (cb) {
		console.log("### Initialize Express Project");
		ExpressInitializer.init(that.projectPath, function (err) {
		    console.log("### Initialize Express Project  -- done --");
		    cb(err);
		});
	    },
	    function initDdl (cb) {
		console.log("### Initialize DDL");
		that.initDdl(function (err) {
		    console.log("### Initialize DDL  -- done --");
		    cb(err);
		});
	    },
	    function (cb) {
		console.log("### Preparing models");
		that.prepareModels(function (err, _modelList) {
		    console.log("### Preparing models  -- done --");
		    modelList = _modelList;
		    console.log(modelList);
		    cb(err);
		});
	    },
	    function (cb) {
		console.log("### Generating mongoose models");
		var tmplPath = 'templates/mongoose.js';
		var outDir = path.join(that.projectPath, 'models');
		MongooseUtils.generate(that.projectName, modelList, tmplPath, outDir, function (err) {
		    console.log("### Generating mongoose models  -- done --");
		    cb(err);
		});
	    },
	    function (cb) {
		console.log("### Generating express routers");
		var tmplPath = 'templates/express/route.js';
		var outDir = path.join(that.projectPath, 'routes');
		ExpressGenerator.genRoutes(modelList, tmplPath, outDir, function (err) {
		    console.log("### Generating express routers  -- done --");
		    cb(err);
		});
	    },
	    function (cb) {
		console.log("### Generating express app");
		var tmplPath = 'templates/express/app.js';
		var outDir = that.projectPath;
		ExpressGenerator.genApp(modelList, tmplPath, outDir, function (err) {
		    console.log("### Generating express app  -- done --");
		    cb(err);
		});
	    },
	    function (cb) {
		console.log("### Generating AngularJS service");
		var tmplDir = 'templates/angularjs';
		var outDir = path.join(that.projectPath, 'public', 'javascripts');
		AngularJSGenerator.generate(modelList, tmplDir, outDir, function (err) {
		    console.log("### Generating AngularJS service  -- done --");
		    cb(err);
		});

	    }	    
	], function (err) {
	    
	});
    },

    prepareModels: function (callback) {
	var that = this;
	var models = Utils.fs.files(that.jsonDir, ".json").map(function (f) {
	    var model = {
		name: f.split(".json")[0],
		path: path.join(that.jsonDir, f)
	    };
	    return model;
	});
	var list = [];
	async.forEachSeries(models, function (model, next) {
	    var analyzer = new JSONAnalyzer(model.path);
	    var modelName = model.name;
	    analyzer.analyze(function (err, typesMap) {
		list.push([modelName, typesMap]);
		next(err);
	    });
	}, function (err) {
	    callback(err, list);
	});
    },

    initDdl: function (callback) {
	var that = this,
	    ddlDir = path.join(that.projectPath, 'ddl');
	async.waterfall([
	    function (cb) {
		var fname = "import.js",
		    infile = path.join('templates/tools', fname),
		    outfile = path.join(that.projectPath, fname);
		Utils.fs.copyFile(infile, outfile);
		fs.mkdir(ddlDir, function (err) {
		    cb(err);
		});
	    },
	    function (cb) {
		var files = Utils.fs.files(that.jsonDir, '.json');
		files.forEach(function (file) {
		    var infile = path.join(that.jsonDir, file),
			outfile = path.join(ddlDir, file);
		    Utils.fs.copyFile(infile, outfile);
		});
		cb();
	    }
	], function (err) {
	    callback(err);
	});
    }
};

module.exports = ArtistaMean;
