const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const models = require("../db/models");

const router = express.Router();

mongoose.connect("mongodb://localhost/pdfannotationtool");

const multer = require("multer");

router.use(bodyParser.json());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "files/")
    },
});

const upload = multer({ storage: storage });

router.post("/documents", upload.single("pdf"), (req, res) => {
    console.log(req);
    const newFile = new models.Document({
        _id: req.file.filename,
        userID: null,
        name: req.file.originalname,
        size: req.file.size,
    });

    newFile.save().then(document => {
       res.json({
           id: document._id,
           userID: document.userID,
           name: document.name,
           size: document.size
       });

    }).catch(err => {
        res.status(500).send("Internal Server error");
    });
});

router.get("/documents", (req, res) => {
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

router.get("/documents/:id", (req, res) => {
    models.Document.findById(req.params.id).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }

        const path = "files/" + result._id;
        const stream = fs.createReadStream(path);
        stream.pipe(res);
    }).catch(err => {
        if (err) {
            res.status(500).send("Internal server error");
        }
    });
});

router.delete("/documents/:id", (req, res) => {
    models.Document.findById(req.params.id).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }

        const path = "files/" + result._id;
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


router.get("/annotationsets", (req, res) => {
   models.AnnotationSet.find().then(result => {
       const annotationSets = [];

       for (let set of result) {
           annotationSets.push({
               id: set._id,
               documentID: set.documentID,
               userID: set.userID,
               locked: set.locked
           });
       }

       res.json(annotationSets);
   }).catch(err => {
       res.status(500).send("Internal server error");
   });
});


router.post("/annotationsets", (req, res) => {

    if (!req.body.hasOwnProperty("documentID")) {
        res.send(400).send("Bad request");
        return;
    }

    models.Document.findById(req.body.documentID).then(result => {
        if (!result) {
            res.status(400).send("Bad request");
            return;
        }

        const set = new models.AnnotationSet({
            documentID: result.documentID,
            userID: null,
            locked: false,
        });

        set.save().then(savedSet => {
            res.json({
                id: savedSet._id,
                documentID: savedSet.documentID,
                userID: savedSet.userID,
                locked: savedSet.locked
            })
        }).catch(err => {
            res.status(500).send("Internal server error");
        });

    }).catch(err => {
        res.status(500).send("Internal server error");
    });
});


router.get("/annotationsets/:id", (req, res) => {
    models.AnnotationSet.findById(req.params.id).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }

        res.json({
            id: result._id,
            documentID: result.documentID,
            userID: result.userID,
            locked: result.locked
        });

    }).catch(err => {
        res.status(500).send("Internal server error" + err);
    })
});


router.delete("/annotationsets/:id", (req, res) => {
    // TODO: Remove all annotations which reference this annotation set
    models.AnnotationSet.findById(req.params.id).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }
        result.remove();
        res.send("Okay");

    }).catch(err => {
        res.status(500).send("Internal server error" + err);
    })
});


router.get("/annotationsets/:id/annotations", (req, res) => {
    models.AnnotationSet.findById(req.params.id).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        models.Annotation.find({setID: set._id}).then(annotations => {
            const result = [];

            for (let annotation of annotations) {
                result.push({
                    id: annotation._id,
                    setID: annotation.setID,
                    pageNumber: annotation.pageNumber,
                    propertis: annotation.properties
                });
            }

            res.json(result);
        }).catch(err => {
            res.status(500).send("Internal server error" + err);
        })

    }).catch(err => {
        res.status(500).send("Internal server error" + err);
    })
});

router.post("/annotationsets/:id/annotations", (req, res) => {
    if (!req.body.hasOwnProperty("setID")) {
        res.send(400).send("Bad request");
        return;
    }

    if (!req.body.hasOwnProperty("pageNumber")) {
        res.send(400).send("Bad request");
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        res.send(400).send("Bad request");
        return;
    }


    models.AnnotationSet.findById(req.params.id).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        const annotation = new models.Annotation({
            setID: req.body.setID,
            pageNumber: req.body.pageNumber,
            properties: req.body.properties,
        });

        annotation.save().then(savedAnnotation => {
            res.json({
               id: savedAnnotation._id,
               setID: savedAnnotation.setID,
               pageNumber: savedAnnotation.pageNumber,
               properties: savedAnnotation.properties,
            });
        }).catch(err => {
            res.status(500).send("Internal server error" + err);
        });
    }).catch(err => {
        res.status(500).send("Internal server error" + err);
    })
});


module.exports = router;