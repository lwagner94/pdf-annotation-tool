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

router.post('/upload', upload.single('pdf'), function(req, res) {
    console.log(req);
    const newFile = new models.Document({
        name: req.file.originalname,
        path: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype
    });

    newFile.save((err, newFile) => {
       if (err)
           res.status(500).send('DB Error');

       res.json({status: 0, path: req.file.filename});
    });
});

router.get('/file/:path', function(req, res){
    models.Document.find({path: req.params.path}, (err, result) => {
        if (err) {
           res.status(500);
           return;
        }
        if (result.length !== 1) {
            res.status(404).send();
            return;
        }

        const path = 'files/' + req.params.path;
        const stream = fs.createReadStream(path);
        stream.pipe(res);
    });
});

module.exports = router;