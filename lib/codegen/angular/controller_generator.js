"use strict";

const fs = require('fs');
const path = require('path');
const util = require('util');

function generateController (model, tmplDir, annotations, args, outDir) {
    const tmplFile = path.join(tmplDir, 'controller.js');
    const template = fs.readFileSync(tmplFile, 'utf8');
    const modelName = model.name;
    const code = util.format(template, modelName, modelName, modelName,
			     modelName, modelName,
			     modelName,
			     modelName, modelName,
			     modelName,
			     modelName, modelName);
    console.log(code);
    const outPath = path.join(outDir, util.format("%sController.js", modelName));
    fs.writeFileSync(outPath, code);
}

class ControllerGenerator {

    static generate (modelList, tmplDir, outDir) {
	const tmplFile = path.join(tmplDir, 'controller.js');
	const template = fs.readFileSync(tmplFile, 'utf8');
	const annotations = modelList.map(function (m) {
	    return util.format("'%s'", m.name);
	}).join(', ');
	const args = modelList.map(function (m) {
	    return m.name;
	}).join(', ');
	modelList.forEach((model) => {
	    generateController(model, tmplDir, annotations, args, outDir);
	});
	/**
	const queries = modelList.map(function (m) {
	    return util.format("    $scope.%s = %s.query();", m.name, m.name);
	}).join('\n');
	const xxx = modelList.map(function (m) {
	    return m.name;
	});
	const code = util.format(template, annotations, args, queries, xxx[0], xxx[0], xxx[0], xxx[0], xxx[0], xxx[0]);
	const outPath = path.join(outDir, "controller.js");
	fs.writeFileSync(outPath, code);
	*/
    }
}

module.exports = ControllerGenerator;
