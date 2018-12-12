const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const models = require("../db/models");

const router = express.Router();

const multer = require("multer");

router.use(bodyParser.json());

function getFilePath() {
    if (process.env.NODE_ENV === "test")
        return "files-test/";
    return "files/";

}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getFilePath())
    },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("pdf"), (req, res) => {
    const newFile = new models.Document({
        _id: req.file.filename,
        userID: null,
        name: req.file.originalname,
        size: req.file.size,
    });

    newFile.save().then(document => {
        res.location(`/api/documents/${document._id}`);
        res.status(201).send();

    }).catch(err => {
        res.status(500).send("Internal Server error");
    });
});

router.get("/", (req, res) => {
    models.Document.find({}).then(result => {
        const documents = [];

        for (let document of result) {
            documents.push({
                id: document._id,
                userID: document.userID,
                name: document.name,
                size: document.size
            });
        }

        res.json(documents);
    }).catch(err => {
        res.status(500).send("Internal Server Error");
    });
});

router.get("/:id", (req, res) => {
    models.Document.findById(req.params.id).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }

        const path = getFilePath() + result._id;
        const stream = fs.createReadStream(path);
        stream.pipe(res);
    }).catch(err => {
        if (err) {
            res.status(500).send("Internal server error");
        }
    });
});

router.delete("/:id", (req, res) => {
    models.Document.findById(req.params.id).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }

        const path = getFilePath() + result._id;
        fs.unlink(path, (err) => {
            if (err)
                res.status(500).send("Internal server error");
            else
                result.remove();
        });

        res.status(200).send("Okay");
    }).catch(err => {
        res.status(500).send("Internal server error");
    });
});

module.exports = router;