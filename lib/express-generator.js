"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');

var ExpressGenerator = function () {};

function genRoute (model, tmplPath, outDir, callback) {
    var modelName = model[0];
    async.waterfall([
	function (cb) {
	    fs.readFile(tmplPath, 'utf8', function (err, template) {
		var code = util.format(template, modelName);
		cb(err, code);
	    });
	},
	function (code, cb) {
	    var outPath = path.join(outDir, modelName + ".js");
	    fs.writeFile(outPath, code, function (err) {
		cb(err);
	    });
	}
    ], function (err) {
	callback(err);
    });
}

ExpressGenerator.genRoutes = function (modelList, tmplPath, outDir, callback) {
    async.forEach(modelList, function (model, next) {
	genRoute(model, tmplPath, outDir, function (err) {
	    next(err);
	});
    }, function (err) {
	callback(err);
    });
};

ExpressGenerator.genApp = function (modelList, tmplPath, outDir, callback) {
    async.waterfall([
	function (cb) {
	    fs.readFile(tmplPath, 'utf8', function (err, template) {
		cb(err, template);
	    });
	},
	function (template, cb) {
	    var modelNames = modelList.map(function (m) {
		return m[0];
	    });
	    var routers = modelNames.map(function (m) {
		return util.format("var %ss = require('./routes/%s');", m, m);
	    });
	    var apis = modelNames.map(function (m) {
		return util.format("app.use('/api/v1/%ss', %ss);", m, m);
	    });
	    var code = util.format(template, routers.join('\n'), apis.join('\n'));
	    var outPath = path.join(outDir, "app.js");
	    fs.writeFile(outPath, code, function (err) {
		cb(err);
	    });
	}
    ], function (err) {
	callback(err);
    });
    
}

module.exports = ExpressGenerator;
