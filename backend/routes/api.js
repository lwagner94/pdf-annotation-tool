const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const models = require('../db/models');

const router = express.Router();

mongoose.connect('mongodb://localhost/pdfannotationtool');

const multer = require('multer');

router.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files/')
    },
});

const upload = multer({ storage: storage });

router.post('/documents', upload.single('pdf'), function(req, res) {
    console.log(req);
    const newFile = new models.Document({
        _id: req.file.filename,
        userID: null,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
    });

    newFile.save((err, newFile) => {
       if (err)
           res.status(500).send('DB Error');

       res.json({status: 0, path: req.file.filename});
    });
});

router.get('/documents/:id', function(req, res){
    models.Document.find({_id: req.params.id}, (err, result) => {
        if (err) {
           res.status(500);
           return;
        }
        if (result.length !== 1) {
            res.status(404).send();
            return;
        }

        const path = 'files/' + req.params.id;
        const stream = fs.createReadStream(path);
        stream.pipe(res);
    });
});

module.exports = router;