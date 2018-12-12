const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const express = require("express");
const models = require("../db/models");

const router = express.Router();

router.use(bodyParser.json());

function checkObjectIdParams(req, res, next) {
    for (let parameterName in req.params) {
        if (parameterName.startsWith("ObjectId_")) {
            const value = req.params[parameterName];

            if (!value.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(404).send("Not found");
                return;
            }
        }
    }
    next();
}

router.get("/", (req, res) => {
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


router.post("/", (req, res) => {

    if (!req.body.hasOwnProperty("documentID")) {
        res.status(400).send("Bad request");
        return;
    }

    models.Document.findById(req.body.documentID).then(result => {
        if (!result) {
            res.status(400).send("Bad request");
            return;
        }

        const set = new models.AnnotationSet({
            documentID: result._id,
            userID: null,
            locked: false,
        });
        return set.save();
    }).then(savedSet => {
        res.location(`/api/annotationsets/${savedSet._id}`);
        res.status(201).send();
    }).catch(err => {
        console.log(err);
        res.status(500).send("Internal server error");
    })
});


router.get("/:ObjectId_set", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(result => {
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


router.delete("/:ObjectId_set", checkObjectIdParams, (req, res) => {
    // TODO: Remove all annotations which reference this annotation set
    models.AnnotationSet.findById(req.params.ObjectId_set).then(result => {
        if (!result) {
            res.status(404).send("Not found");
            return;
        }
        result.remove();
        res.status(200).send();

    }).catch(err => {
        res.status(500).send("Internal server error" + err);
    })
});


router.get("/:ObjectId_set/annotations", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        return models.Annotation.find({setID: set._id})
    }).then(annotations => {
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
});

router.post("/:ObjectId_set/annotations", checkObjectIdParams, (req, res) => {
    if (!req.body.hasOwnProperty("setID")) {
        res.status(400).send("Bad request");
        return;
    }

    if (!req.body.hasOwnProperty("pageNumber")) {
        res.status(400).send("Bad request");
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        res.status(400).send("Bad request");
        return;
    }


    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        const annotation = new models.Annotation({
            setID: req.body.setID,
            pageNumber: req.body.pageNumber,
            properties: req.body.properties,
        });

        return annotation.save();
    }).then(savedAnnotation => {
        res.location(`/api/annotationsets/${savedAnnotation.setID}/annotations/${savedAnnotation._id}`);
        res.status(201).send();
    }).catch(err => {
        res.status(500).send("Internal server error" + err);
    })
});

router.get("/:ObjectId_set/annotations/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        return models.Annotation.findById(req.params.ObjectId_annotation)
    }).then(annotation => {
        if (!annotation) {
            res.status(404).send("Not found");
            return;
        }

        res.json({
            id: annotation._id,
            setID: annotation.setID,
            pageNumber: annotation.pageNumber,
            properties: annotation.properties
        });
    }).catch(err => {
        res.status(500).send("Internal server error");
    });
});


router.put("/:ObjectId_set/annotations/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
    if (!req.body.hasOwnProperty("pageNumber")) {
        res.status(400).send("Bad request");
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        res.status(400).send("Bad request");
        return;
    }


    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        return models.Annotation.findById(req.params.ObjectId_annotation)
    }).then(annotation => {
        if (!annotation) {
            res.status(404).send("Not found");
            return;
        }

        annotation.pageNumber = req.body.pageNumber;
        annotation.properties = req.body.properties;

        return annotation.save();
    }).then(result => {
        res.location(`/api/annotationsets/${result.setID}/annotations/${result._id}`);
        res.status(201).send();
    }).catch(err => {
        res.status(500).send("Internal server error");
    });
});

router.delete("/:ObjectId_set/annotations/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            res.status(404).send("Not found");
            return;
        }

        return models.Annotation.findById(req.params.ObjectId_annotation)
    }).then(annotation => {
        if (!annotation) {
            res.status(404).send("Not found");
            return;
        }
        return annotation.remove()
    }).then(() => {
        res.status(200).send();

    }).catch(err => {
        res.status(500).send("Internal server error");
    });
});

module.exports = router;