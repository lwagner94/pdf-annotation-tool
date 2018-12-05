const express = require('express');
const router = express.Router();
const models = require('../db/models');


/* GET home page. */
router.get('/', function (req, res, next) {
    models.Document.find((err, documents) => {
        if (err) {
            res.code(500).send("DB Error");
        }

        res.render('index', {title: 'Express', documents: documents});
    });

});

router.get('/upload', (req, res, next) => {
    res.render('upload');
});

module.exports = router;
