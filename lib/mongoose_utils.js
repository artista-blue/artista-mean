"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');

var MongooseUtils = function () {};

/**
 * Returns schema type
 */
function getType(str) {
    switch (str) {
    case 'number':
	return 'Number';
    case 'string':
	return 'String';
    case 'boolean':
	return 'Boolean';
    case 'array':
	return '[]';
    default:
	return 'mongoose.Schema.Types.Mixed';
    };    
}

/**
 * Generate code for schema definition
 */
function generateSchema (model) {
    var modelName = model[0],
	schemaData = model[1],
	lines = [],
	schemaLines = [];
    lines.push("");
    lines.push(util.format("var %sSchema = mongoose.Schema({", modelName));

    schemaData.forEach(function (type, name) {
	schemaLines.push(util.format("\t%s: %s", name, getType(type)));
    });
    lines.push(schemaLines.join(",\n"));
    lines.push("});");
    lines.push("");
    lines.push(util.format("Models.%s = mongoose.model('%s', %sSchema);", modelName, modelName, modelName));
    lines.push("");
    return lines.join('\n');
}

/**
 * Generate code for schemas
 */
function generateSchemas (modelList) {
    var text = "";
    modelList.forEach(function (model) {
	text += generateSchema(model);
    });
    return text;
}

var FILE_NAME = 'models.js';

var DB_HOST = 'localhost';

/**
 * Generate code for mongoose
 */
MongooseUtils.generate = function (projectName, modelList, tmplPath, outDir, callback) {
    var db = projectName,
	template;
    async.waterfall([
	function readTemplate (cb) {
	    fs.readFile(tmplPath, 'utf8', function (err, tmpl) {
		template = tmpl;
		cb(err);
	    });
	},
	function mkdir (cb) {
	    fs.mkdir(outDir, function (err) {
		if (err) {
		    console.log(err);
		}
		cb(err);
	    });
	},
	function write (cb) {
	    var schemas = generateSchemas(modelList),
		generated = util.format(template, DB_HOST, db, schemas),
		outPath = path.join(outDir, FILE_NAME);
	    fs.writeFile(outPath, generated, function (err) {
		cb(err);
	    });
	}
    ], function (err) {
	callback(err);
    });
};

module.exports = MongooseUtils;
