"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');

var AngularJSGenerator = function () {};

AngularJSGenerator.generate = function (modelList, outDir, callback) {
    var lines = [],
	outPath = path.join(outDir, "service.js");;
    modelList.forEach(function (model) {
	var modelName = model[0];
	lines.push(util.format("app.factory('%s', ['$resource', function ($resource) {", modelName));
	lines.push(util.format("    return $resource('/api/v1/%ss');", modelName));
	lines.push("}]);");
	lines.push("");
    });
    fs.writeFile(outPath, lines.join('\n'), function (err) {
	callback(err);
    });
};

module.exports = AngularJSGenerator;
