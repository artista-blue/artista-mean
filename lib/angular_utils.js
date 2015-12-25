"use strict";

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');

var Utils = require('./utils');

class AngularOps {
    
    static copyApp (tmplDir, outDir) {
	var fname = "app.js",
	    infile = path.join(tmplDir, fname),
	    outfile = path.join(outDir, fname);
	Utils.fs.copyFile(infile, outfile);
    }

    static generateService (modelList, outDir, callback) {
	var lines = [],
	    outPath = path.join(outDir, "service.js");;
	modelList.forEach(function (model) {
	    var modelName = model.name;
	    lines.push(util.format("app.factory('%s', ['$resource', function ($resource) {", modelName));
	    lines.push(util.format("    return $resource('/api/v1/%ss/:id', { id: '@id' });", modelName));
	    lines.push("}]);");
	    lines.push("");
	});
	fs.writeFile(outPath, lines.join('\n'), function (err) {
	    callback(err);
	});
    }

    static generateController (modelList, tmplDir, outDir, callback) {
	var tmplFile = path.join(tmplDir, 'controller.js');
	async.waterfall([
	    function (cb) {
		fs.readFile(tmplFile, 'utf8', function (err, template) {
		    cb(err, template);
		});
	    },
	    function (template, cb) {
		var annotations = modelList.map(function (m) {
		    return util.format("'%s'", m.name);
		}).join(', ');
		var args = modelList.map(function (m) {
		    return m.name;
		}).join(', ');
		var queries = modelList.map(function (m) {
		    return util.format("    $scope.%s = %s.query();", m.name, m.name);
		}).join('\n');
		var code = util.format(template, annotations, args, queries);
		var outPath = path.join(outDir, "controller.js");
		fs.writeFile(outPath, code, function (err) {
		    cb(err);
		});
	    }
	], function (err) {
	    callback(err);
	});
    }

    static generateAdminHTML (modelList, tmplDir, outDir, callback) {
	var tmplFile = path.join(tmplDir, 'admin.html');
	async.waterfall([
	    function (cb) {
		fs.readFile(tmplFile, 'utf8', function (err, template) {
		    cb(err, template);
		});
	    },
	    function (template, cb) {
		var lines = [];
		modelList.forEach(function (model) {
		    var modelName = model.name,
			schemas = Utils.iter2arr(model.types.keys());
		    lines.push("<div>");
		    lines.push(util.format("<h2>%s</h2>", modelName));
		    lines.push("<table class='table'>");
		    lines.push("<thead>");
		    lines.push("<tr>");
		    var heads = "";
		    schemas.map(function (schema) {
			heads += "<td>" + schema + "</td>";
		    });
		    heads += "<td></td>";
		    lines.push(heads);
		    lines.push("</tr>");
		    lines.push("</thead>");
		    lines.push(util.format("<tr ng-repeat='item in %s'>", modelName));

		    var bodies = "";
		    schemas.map(function (schema) {
			bodies += util.format("<td>{{ item.%s }}</td>", schema);
		    });
		    bodies += util.format('<td><button ng-click="delete($index, %s)">delete</button></td>', modelName);
		    lines.push(bodies);

		    lines.push("</tr>");
		    lines.push("</table>");
		    lines.push("</div>");
		});
		var code = util.format(template, lines.join('\n'));
		var outPath = path.join(outDir, "..", "admin.html");
		fs.writeFile(outPath, code, function (err) {
		    cb(err);
		});
	    }
	], function (err) {
	    callback(err);
        });
    }
}

var AngularUtils = function () {};

AngularUtils.init = function (modelList, tmplDir, outDir, callback) {
    async.waterfall([
	function (cb) {
	    AngularOps.copyApp(tmplDir, outDir);
	    AngularOps.generateService(modelList, outDir, function (err) {
		cb(err);
	    });
	},
	function (cb) {
	    AngularOps.generateController(modelList, tmplDir, outDir, function (err) {
		cb(err);
	    });
	},
	function (cb) {
	    AngularOps.generateAdminHTML(modelList, tmplDir, outDir, function (err) {
		cb(err);
	    });
	},
	function (cb) {
	    var fname = "bower.json",
		infile = path.join(tmplDir, fname),
		outfile = path.join(outDir, "..", fname);
	    Utils.fs.copyFile(infile, outfile);
	    cb();
	},
	function (cb) {
	    var baseDir = path.join(outDir, "..");
	    var cmds = ["cd", baseDir, "&&", "bower", "install"];
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
};

module.exports = AngularUtils;
