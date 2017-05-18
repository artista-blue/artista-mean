var express = require('express');
var mongodb = require('mongodb');
var router = express.Router();
var Model = require('../models/models');

router.get('/', function(req, res) {
    Model.%s.find(function (err, models) {
	if (err) {
	    console.log(err);
	    res.status(500).end();
	} else {
	    res.status(200).send(models);
	}
    });
});

router.post('/', function(req, res) {
    var model = req.body;
    Model.%s.create(model, function (err, _item) {
	if (err) {
	    console.log(err);
	    res.status(500).end();
	} else {
	    res.status(200).end();
	}
    });
});

router.delete('/:_id', function(req, res) {
    var _id = req.params._id;
    Model.%s.findOne(mongodb.ObjectID(_id), function (err, model) {
	if (err) {
	    res.status(500).end(); return;
	}
	if (!model) {
	    res.status(200).end(); return;	    
	}
	model.remove(function(err) {
	    if (err) {
		console.log(err);
		res.status(500).end();
	    } else {
		res.status(200).end();
	    }
	});
    });
});

module.exports = router;
