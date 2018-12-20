const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const models = require("../db/models");

const HTTPError = require("../lib/util").HTTPError;
const handleError = require("../lib/util").handleError;

const thumbnail = require("../lib/thumbnail");

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

    return newFile.save().then(document => {
        res.location(`/api/documents/${document._id}`);
        res.status(201).send();
    }).catch(err => {
        handleError(res, err);
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
        handleError(res, err);
    });
});

router.get("/:id", (req, res) => {
    models.Document.findById(req.params.id).then(result => {
        if (!result) {
            throw new HTTPError(404);
        }

        const path = getFilePath() + result._id;
        const stream = fs.createReadStream(path);
        res.type("application/pdf");
        stream.pipe(res);
    }).catch(err => {
        handleError(res, err);
    });
});


router.get("/:id/thumb", (req, res) => {
    models.Document.findById(req.params.id).then(result => {
        if (!result) {
            throw new HTTPError(404);
        }

        const path = getFilePath() + result._id;

        thumbnail.generateThumbnail(path).then(stream => {
            stream.pipe(res);
        });
    }).catch(err => {
        handleError(res, err);
    });
});

router.delete("/:id", async (req, res) => {
    try {
        const document = await models.Document.findById(req.params.id);

        if (!document) {
            throw new HTTPError(404);
        }

        const sets = await models.AnnotationSet.find({documentID: document._id});

        for (let set of sets) {
            const annotations = await models.Annotation.find({setID: set._id});

            for (let annotation of annotations) {
                annotation.remove();
            }

            set.remove();
        }

        res.status(200).send();
        
        const path = getFilePath() + document._id;
        fs.unlink(path, (err) => {
            if (err)
                throw err;
            else
                document.remove();
        });

        res.status(200).send();
    }
    catch (e) {
        handleError(res, e);
    }
});

module.exports = router;