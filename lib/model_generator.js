"use strict";

const fs = require('fs');
const path = require('path');

const ModelAnalyzer = require('./model_analyzer');
const Utils = require('./utils');

/**
 * Generate model objects from JSON files.
 */
class ModelGenerator {

    constructor (jsonDir) {
	this.jsonDir = jsonDir;
	this.modelList = [];
    }
	
    /**
     * Generate
     */
    generate() {
	const that = this;
	const models = Utils.fs.files(that.jsonDir, ".json").map(function (f) {
	    const model = {
		name: f.split(".json")[0],
		path: path.join(that.jsonDir, f)
	    };
	    return model;
	});
	models.forEach(function (model) {
	    const analyzer = new ModelAnalyzer(model.path);
	    const modelName = model.name;
	    const typesMap = analyzer.analyze();
	    that.modelList.push({
		name: modelName,
		types: typesMap
	    });
	});
    }

    getModels () {
	return this.modelList;
    }

    toFile(path) {
	const json = JSON.stringify(this.modelList, null, 4);
	fs.writeFileSync(path, json, 'utf8');
    }
}

module.exports = ModelGenerator;
