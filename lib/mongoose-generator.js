"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');

var async = require('async');

var MongooseGenerator = function () {};

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

function generateSchemas (modelList) {
    var text = "";
    modelList.forEach(function (model) {
	text += generateSchema(model);
    });
    return text;
}

MongooseGenerator.gen = function (modelList, tmplPath, outDir, callback) {
    var host = 'localhost',
	db = 'dbname',
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
	    var schemas = generateSchemas(modelList);
	    var generated = util.format(template, host, db, schemas);
	    var outPath = path.join(outDir, 'models.js');
	    fs.writeFile(outPath, generated, function (err) {
		cb(err);
	    });
	}
    ], function (err) {
	callback(err);
    });
};

module.exports = MongooseGenerator;
