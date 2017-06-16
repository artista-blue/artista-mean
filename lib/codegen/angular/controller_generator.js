"use strict";

const fs = require('fs');
const path = require('path');
const util = require('util');

class ControllerGenerator {

    static generate (modelList, tmplDir, outDir) {
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
}

module.exports = ControllerGenerator;
