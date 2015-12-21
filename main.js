"use strict";

var ArtistaMean = require('./lib/artista-mean');

var projectName = "ProjectX",
    jsonDir = "./json",
    project;

project = new ArtistaMean(projectName, jsonDir);
project.generate();
