"use strict";

var mongoose = require('mongoose');

mongoose.connect('mongodb://%s/%s');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'DB open error:'));
db.once('open', function (callback) {
    console.log("DB open success");
});

var Models = function () {};

///// Auto generated schemas
%s
////////////////////////////

module.exports = Models;


