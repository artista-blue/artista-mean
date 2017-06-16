"use strict";

var execSync = require('child_process').execSync;
var fs = require('fs');
var os = require('os');
var path = require('path');
var util = require('util');

var Utils = require('../../utils');

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
	const xxx = modelList.map(function (m) {
	    return m.name;
	});
	var code = util.format(template, annotations, args, queries, xxx[0], xxx[0], xxx[0], xxx[0], xxx[0], xxx[0]);
	var outPath = path.join(outDir, "controller.js");
	fs.writeFileSync(outPath, code);
    }

    static generateAdminHTML (modelList, tmplDir, outDir, callback) {
	var tmplFile = path.join(tmplDir, 'admin.html');
	var template = fs.readFileSync(tmplFile, 'utf8');
	var lines = [];
	modelList.forEach(function (model) {
	    var modelName = model.name,
		schemas = Object.keys(model.types);
	    lines.push("<div>");
	    lines.push(util.format("<h2>%s</h2>", modelName));
	    lines.push("<table class='table tbl-stripe'>");
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
	    //
	    lines.push("<tr>");
	    let newEntries = "";
	    schemas.map(function (schema) {
		newEntries += util.format('<td><input id="name" name="name" type="text" ng-model="newItem.%s"/></td>', schema);
	    });
	    newEntries += util.format('<td><button ng-click="append(newItem)">add</button></td>', modelName);
	    lines.push(newEntries);
	    
	    lines.push("</tr>");
	    lines.push("</table>");
	    lines.push("</div>");
	});
	var code = util.format(template, lines.join(os.EOL));
	var outPath = path.join(outDir, "..", "admin.html");
	console.log(code)
	fs.writeFileSync(outPath, code);
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

    static generateService (modelList, outDir) {
	var lines = [],
	    outPath = path.join(outDir, "service.js");;
	modelList.forEach(function (model) {
	    var modelName = model.name;
	    var code = AngularCodeGenerator.generate_api_resource(model);
	    lines.push(code);
	});
	fs.writeFileSync(outPath, lines.join('\n'));
    }

    static init (modelList, tmplDir, outDir) {
	AngularOps.copyApp(tmplDir, outDir);
	AngularCodeGenerator.generateService(modelList, outDir);
	AngularOps.generateController(modelList, tmplDir, outDir);
	AngularOps.generateAdminHTML(modelList, tmplDir, outDir);

	var fname = "bower.json",
	    infile = path.join(tmplDir, fname),
	    outfile = path.join(outDir, "..", fname);
	Utils.fs.copyFile(infile, outfile);
	
	var baseDir = path.join(outDir, "..");
	var cmds = ["cd", baseDir, "&&", "bower", "install"];
	var stdout = execSync(cmds.join(' '));
	console.log(stdout);
    }
};

module.exports = AngularCodeGenerator;
