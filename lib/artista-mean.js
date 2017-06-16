"use strict";

var fs = require('fs');
var path = require('path');

var async = require('async');

var ModelGenerator = require('./model_generator');
var MongooseUtils = require('./mongoose_utils');
var AngularCodeGenerator = require('./angular_code_generator');
var ExpressUtils = require('./express_utils');
var Utils = require('./utils');

var ArtistaMean = function (projectPath, jsonDir) {
    this.projectPath = projectPath;
    this.projectName = path.basename(projectPath);
    this.jsonDir = jsonDir;
};

ArtistaMean.prototype = {

    initDdl: function (callback) {
	var that = this,
	    ddlDir = path.join(that.projectPath, 'ddl');
	async.waterfall([
	    function (cb) {
		var fname = "import.js",
		    infile = path.join(__dirname, '..', 'templates', 'tools', fname),
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
    },
    
    generate: function () {
	var that = this,
	    modelList;

	console.log("### Preparing models");
	const mg = new ModelGenerator(that.jsonDir);
	mg.generate();
	modelList = mg.getModels();
	console.log(modelList);
	console.log("### Preparing models  -- done --");

	async.waterfall([
	    function initExpress (cb) {
		ExpressUtils.init(that.projectPath, modelList, function (err) {
		    mg.toFile(path.join(that.projectPath, 'models.json'));
		    cb(err);
		});
	    },
	    function initMongoose (cb) {
		console.log("### Generating mongoose models");
		var tmplPath = path.join(__dirname, '..', 'templates', 'mongoose.js');
		var outDir = path.join(that.projectPath, 'models');
		MongooseUtils.init(that.projectName, modelList, tmplPath, outDir, function (err) {
		    console.log("### Generating mongoose models  -- done --");
		    cb(err);
		});
	    },
	    function initAngularJS (cb) {
		console.log("### Generating AngularJS service");
		var tmplDir = path.join(__dirname, '..', 'templates', 'angularjs');
		var outDir = path.join(that.projectPath, 'public', 'javascripts');
		AngularCodeGenerator.init(modelList, tmplDir, outDir);
		console.log("### Generating AngularJS service  -- done --");		
		cb();
	    },
	    function initDdl (cb) {
		console.log("### Initialize DDL");
		that.initDdl(function (err) {
		    console.log("### Initialize DDL  -- done --");
		    cb(err);
		});
	    }
	], function (err) {
	    if (err) {
		console.log(err);
	    }
	});
    }
};

module.exports = ArtistaMean;
