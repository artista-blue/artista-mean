"use strict";

var fs = require('fs');
var path = require('path');

var async = require('async');

var JSONAnalyzer = require('./json-analyzer');
var MongooseGenerator = require('./mongoose-generator');
var ExpressGenerator = require('./express-generator');

var ArtistaMean = function (projectName, jsonDir) {
    this.projectName = projectName;
    this.jsonDir = jsonDir;
};

ArtistaMean.prototype = {

    generate: function () {
	var that = this;
	async.waterfall([
	    function (cb) {
		that.prepareModels(function (err, modelList) {
		    cb(err, modelList);
		});
	    },
	    function generateCodes (modelList, cb) {
		console.log(modelList);
		async.parallel([function (cb) {
		    var tmplPath = 'templates/mongoose.js';
		    var outDir = 'models';
		    MongooseGenerator.gen(modelList, tmplPath, outDir, function (err) {
			cb(err);
		    });
		}, function (cb) {
		    var appTmplPath = 'templates/express_app.js';
		    var routeTmplPath = 'templates/express_route.js';
		    var outDir = 'routes';
		    ExpressGenerator.genRoutes(modelList, routeTmplPath, outDir, function (err) {
			cb(err);
		    });
		}], function (err) {
		    cb(err);
		});
	    }
	], function (err) {
	    
	});
    },

    prepareModels: function (callback) {
	var that = this;
	var models = fs.readdirSync(that.jsonDir).filter(function (str) {
	    var suffix = ".json";
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}).map(function (f) {
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
    }
};

module.exports = ArtistaMean;
