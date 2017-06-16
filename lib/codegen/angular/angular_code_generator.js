"use strict";

const execSync = require('child_process').execSync;
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');

const Utils = require('../../utils');
const ControllerGenerator = require('./controller_generator');
const ServiceGenerator = require('./service_generator');

class AngularOps {
    
    static copyApp (tmplDir, outDir) {
	var fname = "app.js",
	    infile = path.join(tmplDir, fname),
	    outfile = path.join(outDir, fname);
	Utils.fs.copyFile(infile, outfile);
    }

    static generateAdminHTML (modelList, tmplDir, outDir, callback) {
	var tmplFile = path.join(tmplDir, 'admin.html');
	var template = fs.readFileSync(tmplFile, 'utf8');
	var lines = [];
	const controllers = [];
	modelList.forEach(function (model) {
	    var modelName = model.name,
		schemas = Object.keys(model.types);
	    //
	    controllers.push(util.format('\t<script src="../javascripts/%sController.js"></script>"', modelName));
		//
	    lines.push(util.format('<div ng-controller="%sController"', modelName));
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
	var code = util.format(template, controllers.join(os.EOL), lines.join(os.EOL));
	var outPath = path.join(outDir, "..", "admin.html");
	console.log(code)
	fs.writeFileSync(outPath, code);
    }
}

class AngularCodeGenerator {

    static init (modelList, tmplDir, outDir) {
	AngularOps.copyApp(tmplDir, outDir);
	ServiceGenerator.generate(modelList, outDir);
	ControllerGenerator.generate(modelList, tmplDir, outDir);
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
