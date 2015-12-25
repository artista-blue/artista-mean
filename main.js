"use strict";

var ArtistaMean = require('./lib/artista-mean');

var args = process.argv;

var projectName = args[2],
    jsonDir = args[3],
    project;

project = new ArtistaMean(projectName, jsonDir);
project.generate();
