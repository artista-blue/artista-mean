"use strict";

var async = require('async');
var exec = require('child_process').exec;
var path = require('path');

var Utils = require('./utils');

class ExpressInitializer {
    
    static init (projectPath, callback) {
	var that = this;

	async.waterfall([
	    function init (cb) {
		var cmds = ['express', '-e', projectPath];
		exec(cmds.join(' '), function (err, stdout, stderr) {
		    console.log(stdout);
		    if (err) {
			console.log(stderr);
		    }
		    cb(err);
		});
	    },
	    function copyPackageJson (cb) {
		var fname = 'package.json',
		    src = path.join('templates', fname),
		    dst = path.join(projectPath, fname);
		Utils.fs.copyFile(src, dst);
		cb();
	    },
	    function npmInstall (cb) {
		var cmds = ['cd', projectPath, '&&', 'npm', 'install'];
		exec(cmds.join(' '), function (err, stdout, stderr) {
		    console.log(stdout);
		    if (err) {
			console.log(stderr);
		    }
		    cb(err);
		});
	    }
	], function (err) {
	    callback(err);
	});
    }
}

module.exports = ExpressInitializer;
    
