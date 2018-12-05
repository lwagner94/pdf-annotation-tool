const express = require('express');
const router = express.Router();
const fs = require('fs');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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
});

router.get('/file/:filename', function(req, res){
    const filename = req.params.filename;
    const stream = fs.createReadStream('files/' + filename);
    stream.pipe(res);
});

module.exports = router;