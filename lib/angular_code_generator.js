"use strict";

var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
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

    static generateController (modelList, tmplDir, outDir) {
	var tmplFile = path.join(tmplDir, 'controller.js');
	var template = fs.readFileSync(tmplFile, 'utf8');

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
	fs.writeFileSync(outPath, code);
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

class AngularCodeGenerator {

    static generate_api_resource(model) {
	var code,
	    modelName = model.name,
	    template = [
		"app.factory('%s', ['$resource', function ($resource) {",
		"    return $resource('/api/v1/%ss/:id', { id: '@id' });",
		"}]);",
		""
	    ].join(os.EOL);
	code = util.format(template, modelName, modelName);
	return code;
    }

    static generateService (modelList, outDir, callback) {
	var lines = [],
	    outPath = path.join(outDir, "service.js");;
	modelList.forEach(function (model) {
	    var modelName = model.name;
	    var code = AngularCodeGenerator.generate_api_resource(model);
	    lines.push(code);
	});
	fs.writeFileSync(outPath, lines.join('\n'));
    }

    static init (modelList, tmplDir, outDir, callback) {
	AngularOps.copyApp(tmplDir, outDir);
	AngularCodeGenerator.generateService(modelList, outDir);
	AngularOps.generateController(modelList, tmplDir, outDir);

	async.waterfall([
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
    }
};

module.exports = AngularCodeGenerator;
