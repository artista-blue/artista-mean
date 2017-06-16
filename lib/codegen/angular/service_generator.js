"use strict";

const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

function generateApiResource(model) {
    const modelName = model.name,
	  template = [
	      "app.factory('%s', ['$resource', function ($resource) {",
	      "    return $resource('/api/v1/%ss/:id', { id: '@id' });",
	      "}]);",
	      ""
	  ].join(os.EOL),
	  code = util.format(template, modelName, modelName);
    return code;
}

class ServiceGenerator {

    static generate(modelList, outDir) {
	const lines = [],
	      outPath = path.join(outDir, "service.js");;
	modelList.forEach(function (model) {
	    const modelName = model.name;
	    const code = generateApiResource(model);
	    lines.push(code);
	});
	fs.writeFileSync(outPath, lines.join(os.EOL));
    }
}

module.exports = ServiceGenerator;
