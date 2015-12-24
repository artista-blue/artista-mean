var express = require('express');
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
    model.save(function (err) {
	if (err) {
	    console.log(err);
	    res.status(500).end();
	} else {
	    res.status(200).end();
	}
    });
});

router.delete('/', function(req, res) {
    var model = req.body;
    model.remove(function (err) {
	if (err) {
	    console.log(err);
	    res.status(500).end();
	} else {
	    res.status(200).end();
	}
    });
});

module.exports = router;
