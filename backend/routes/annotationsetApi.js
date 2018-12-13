const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const express = require("express");
const models = require("../db/models");
const HTTPError = require("../lib/util").HTTPError;
const handleError = require("../lib/util").handleError;


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
        handleError(res, err);
    });
});


router.post("/", (req, res) => {
    if (!req.body.hasOwnProperty("documentID")) {
        new HTTPError(400).send(res);
        return;
    }

    models.Document.findById(req.body.documentID).then(result => {
        if (!result) {
            throw new HTTPError(400);
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
        handleError(res, err);
    })
});


router.get("/:ObjectId_set", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(result => {
        if (!result) {
            throw new HTTPError(404);
        }

        res.json({
            id: result._id,
            documentID: result.documentID,
            userID: result.userID,
            locked: result.locked
        });

    }).catch(err => {
        handleError(res, err);
    })
});


router.delete("/:ObjectId_set", checkObjectIdParams, (req, res) => {
    // TODO: Remove all context which reference this annotation set
    models.AnnotationSet.findById(req.params.ObjectId_set).then(result => {
        if (!result) {
            throw new HTTPError(404);
        }
        result.remove();
        res.status(200).send();

    }).catch(err => {
        handleError(res, err);
    })
});


router.get("/:ObjectId_set/context", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            throw new HTTPError(404);
        }

        return models.Annotation.find({setID: set._id})
    }).then(annotations => {
        const result = [];

        for (let annotation of annotations) {
            result.push({
                id: annotation._id,
                setID: annotation.setID,
                pageNumber: annotation.pageNumber,
                properties: annotation.properties
            });
        }

        res.json(result);

    }).catch(err => {
        handleError(res, err);
    })
});

router.post("/:ObjectId_set/context", checkObjectIdParams, (req, res) => {
    if (!req.body.hasOwnProperty("pageNumber")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        new HTTPError(400).send(res);
        return;
    }


    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            throw new HTTPError(404);
        }

        const annotation = new models.Annotation({
            setID: set._id,
            pageNumber: req.body.pageNumber,
            properties: req.body.properties,
        });

        return annotation.save();
    }).then(savedAnnotation => {
        res.location(`/api/annotationsets/${savedAnnotation.setID}/annotations/${savedAnnotation._id}`);
        res.status(201).send();
    }).catch(err => {
        handleError(res, err);
    })
});

router.get("/:ObjectId_set/context/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            throw new HTTPError(404);
        }

        return models.Annotation.findById(req.params.ObjectId_annotation)
    }).then(annotation => {
        if (!annotation) {
            throw new HTTPError(404);
        }

        res.json({
            id: annotation._id,
            setID: annotation.setID,
            pageNumber: annotation.pageNumber,
            properties: annotation.properties
        });
    }).catch(err => {
        handleError(res, err);
    });
});


router.put("/:ObjectId_set/context/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
    if (!req.body.hasOwnProperty("pageNumber")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        new HTTPError(400).send(res);
        return;
    }


    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            throw new HTTPError(404);
        }

        return models.Annotation.findById(req.params.ObjectId_annotation)
    }).then(annotation => {
        if (!annotation) {
            throw new HTTPError(404);
        }

        annotation.pageNumber = req.body.pageNumber;
        annotation.properties = req.body.properties;

        return annotation.save();
    }).then(result => {
        res.location(`/api/annotationsets/${result.setID}/annotations/${result._id}`);
        res.status(200).send();
    }).catch(err => {
        handleError(res, err);
    });
});

router.delete("/:ObjectId_set/context/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
    models.AnnotationSet.findById(req.params.ObjectId_set).then(set => {
        if (!set) {
            throw new HTTPError(404);
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
        handleError(res, err);
    });
});


module.exports = router;