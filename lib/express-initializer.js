"use strict";

var async = require('async');
var exec = require('child_process').exec;

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
    
