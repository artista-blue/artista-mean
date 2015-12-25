"use strict";

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');

var Utils = require('./utils');

class Initializer {
    
    static init (projectPath, callback) {
	var that = this;

	async.waterfall([
	    function init (cb) {
		var cmds = ['express', '-e', projectPath];
		exec(cmds.join(' '), function (err, stdout, stderr) {
		    console.log(stdout);
		    if (err) {
			console.log(stderr);
		    }
		    cb(err);
		});
	    },
	    function copyPackageJson (cb) {
		var fname = 'package.json',
		    src = path.join('templates', fname),
		    dst = path.join(projectPath, fname);
		Utils.fs.copyFile(src, dst);
		cb();
	    },
	    function npmInstall (cb) {
		var cmds = ['cd', projectPath, '&&', 'npm', 'install'];
		exec(cmds.join(' '), function (err, stdout, stderr) {
		    console.log(stdout);
		    if (err) {
			console.log(stderr);
		    }
		    cb(err);
		});
	    }
	], function (err) {
	    callback(err);
	});
    }
}

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

class Generator {

    static routes (modelList, tmplPath, outDir, callback) {
	async.forEach(modelList, function (model, next) {
	    genRoute(model, tmplPath, outDir, function (err) {
		next(err);
	    });
	}, function (err) {
	    callback(err);
	});
    }

    static app (modelList, tmplPath, outDir, callback) {
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
}

var ExpressUtils = function () {};

ExpressUtils.Initializer = Initializer;
ExpressUtils.Generator = Generator;

module.exports = ExpressUtils;
