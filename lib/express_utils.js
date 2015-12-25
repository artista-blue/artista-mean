"use strict";

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');

var Utils = require('./utils');

class Initializer {
    
    init (projectPath, callback) {
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
		    src = path.join(__dirname, '..', 'templates', fname),
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

class Generator {

    route (model, tmplPath, outDir, callback) {
	var modelName = model.name;
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

    routes (modelList, tmplPath, outDir, callback) {
	var that = this;
	async.forEach(modelList, function (model, next) {
	    that.route(model, tmplPath, outDir, function (err) {
		next(err);
	    });
	}, function (err) {
	    callback(err);
	});
    }

    app (modelList, tmplPath, outDir, callback) {
	async.waterfall([
	    function (cb) {
		fs.readFile(tmplPath, 'utf8', function (err, template) {
		    cb(err, template);
		});
	    },
	    function (template, cb) {
		var modelNames = modelList.map(function (m) {
		    return m.name;
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

ExpressUtils.init = function (projectPath, modelList, callback) {
    var initializer = new Initializer(),
	generator = new Generator();
    async.waterfall([
	function initExpress (cb) {
	    console.log("### Initialize Express Project");
	    initializer.init(projectPath, function (err) {
		console.log("### Initialize Express Project  -- done --");
		cb(err);
	    });
	},
	function (cb) {
	    console.log("### Generating express routers");
	    var tmplPath = path.join(__dirname, '..', 'templates', 'express', 'route.js');
	    var outDir = path.join(projectPath, 'routes');
	    generator.routes(modelList, tmplPath, outDir, function (err) {
		console.log("### Generating express routers  -- done --");
		cb(err);
	    });
	},
	function (cb) {
	    console.log("### Generating express app");
	    var tmplPath = path.join(__dirname, '..', 'templates', 'express', 'app.js');
	    var outDir = projectPath;
	    generator.app(modelList, tmplPath, outDir, function (err) {
		console.log("### Generating express app  -- done --");
		cb(err);
	    });
	}
    ], function (err) {
	callback(err);
    });
};

module.exports = ExpressUtils;
