const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const express = require("express");
const fetch = require("node-fetch");
const models = require("../db/models");
const HTTPError = require("../lib/util").HTTPError;
const handleError = require("../lib/util").handleError;


const router = express.Router();

router.use(bodyParser.json());

const AUTOANNOTATOR_URL = "http://localhost:4567";


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
                locked: set.locked,
                name: set.name
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

    if (!req.body.hasOwnProperty("name")) {
        new HTTPError(400).send(res);
        return;
    }

    if (req.body.name.length === 0) {
        new HTTPError(400, "Name must not be empty").send(res);
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
            name: req.body.name
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
            locked: result.locked,
            name: result.name
        });

    }).catch(err => {
        handleError(res, err);
    })
});


router.delete("/:ObjectId_set", checkObjectIdParams, async (req, res) => {
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);
        if (!set) {
            throw new HTTPError(404);
        }

        const annotations = await models.Annotation.find({setID: set._id});

        for (let annotation of annotations) {
            annotation.remove();
        }

        const labels = await models.Label.find({setID: set._id});

        for (let label of labels) {
            label.remove();
        }
        set.remove();
        res.status(200).send();
    }
    catch (e) {
        handleError(res, e);
    }
});


router.get("/:ObjectId_set/annotations", checkObjectIdParams, (req, res) => {
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
                labelID: annotation.labelID,
                pageNumber: annotation.pageNumber,
                properties: annotation.properties
            });
        }

        res.json(result);

    }).catch(err => {
        handleError(res, err);
    })
});

router.get("/:ObjectId_set/export", checkObjectIdParams, async (req, res) => {
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);
        if (!set)
            throw new HTTPError(404);

        const document = await models.Document.findById(set.documentID);
        if (!document) {
            // We have a set that references a non existing document,
            // this should not happen.
            throw new HTTPError(500);
        }
        const annotations = await models.Annotation.find({setID: set.id});
        const labels = await models.Label.find({setID: set.id});


        const cleanedAnnotations = [];

        for (let annotation of annotations) {
            const parsedProperties = JSON.parse(annotation.properties);
            cleanedAnnotations.push({
                pageNumber: annotation.pageNumber,
                label: labels.find(label => label._id.equals(annotation.labelID)).name,
                type: parsedProperties.type,
                data: parsedProperties.data
            });
        }

        const cleanedLabels = [];

        for (let label of labels) {
            cleanedLabels.push({
                name: label.name,
                color: label.color
            });
        }

        const result = {
            document: {
                name: document.name,
                size: document.size
            },
            annotationSet: {
                name: set.name,
                annotations: cleanedAnnotations,
                labels: cleanedLabels
            }
        };

        res.json(result)
    }
    catch (e) {
        handleError(res, e);
    }
});

router.post("/import", checkObjectIdParams, async (req, res) => {
    try {
        if (!req.body.hasOwnProperty("documentID")) {
            throw new HTTPError(400);
        }

        if (!req.body.hasOwnProperty("importedFile")) {
            throw new HTTPError(400);
        }

        const importedFile = JSON.parse(req.body.importedFile);

        const document = await models.Document.findById(req.body.documentID);

        if (!document) {
            throw new HTTPError(400)
        }

        if (!importedFile.hasOwnProperty("document") || !importedFile.hasOwnProperty("annotationSet")) {
            throw new HTTPError(400, "Malformed JSON file");
        }

        // TODO: More validation for imported json?

        const newSet = new models.AnnotationSet({
            documentID: document._id,
            userID: null,
            locked: false,
            name: importedFile.annotationSet.name
        });

        const savedSet = await newSet.save();

        let newLabels = [];
        for (let label of importedFile.annotationSet.labels) {
            newLabels.push(new models.Label({
                setID: savedSet._id,
                name: label.name,
                color: label.color
            }).save());
        }

        newLabels = await Promise.all(newLabels);

        const newAnnotations = [];
        for (let annotation of importedFile.annotationSet.annotations) {
            const newAnnotation = new models.Annotation({
                setID: savedSet._id,
                pageNumber: annotation.pageNumber,
                labelID: newLabels.find(label => label.name === annotation.label)._id,
                properties: JSON.stringify({
                    type: annotation.type,
                    data: annotation.data
                }),
            });

            newAnnotations.push(newAnnotation.save());
        }

        Promise.all(newAnnotations).then(() => {
            res.location(`/api/annotationsets/${savedSet._id}/`);
            res.status(201).send();
        });
    }
    catch (e) {
        handleError(res, e);
    }
});


router.post("/:ObjectId_set/annotations", checkObjectIdParams, async (req, res) => {
    if (!req.body.hasOwnProperty("pageNumber")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("labelID")) {
        new HTTPError(400).send(res);
        return;
    }

    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set)
        if (!set) {
            throw new HTTPError(404);
        }

        const annotation = new models.Annotation({
            setID: set._id,
            labelID: req.body.labelID,
            pageNumber: req.body.pageNumber,
            properties: req.body.properties,
        });

        const savedAnnotation = await annotation.save();

        res.location(`/api/annotationsets/${savedAnnotation.setID}/annotations/${savedAnnotation._id}`);
        res.status(201).send();
    } catch (e) {
        handleError(res, e);
    }
});

router.get("/:ObjectId_set/annotations/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
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
            labelID: annotation.labelID,
            pageNumber: annotation.pageNumber,
            properties: annotation.properties
        });
    }).catch(err => {
        handleError(res, err);
    });
});


router.put("/:ObjectId_set/annotations/:ObjectId_annotation", checkObjectIdParams, async (req, res) => {
    if (!req.body.hasOwnProperty("pageNumber")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("properties")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("labelID")) {
        new HTTPError(400).send(res);
        return;
    }


    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);

        if (!set) {
            throw new HTTPError(404);
        }

        const annotation = await models.Annotation.findById(req.params.ObjectId_annotation)

        if (!annotation) {
            throw new HTTPError(404);
        }

        annotation.labelID = req.body.labelID;
        annotation.pageNumber = req.body.pageNumber;
        annotation.properties = req.body.properties;

        const result = await annotation.save();

        res.location(`/api/annotationsets/${result.setID}/annotations/${result._id}`);
        res.status(200).send();
    }
    catch (e) {
        handleError(res, e);
    }
});

router.delete("/:ObjectId_set/annotations/:ObjectId_annotation", checkObjectIdParams, (req, res) => {
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

router.get("/:ObjectId_set/annotations/:ObjectId_annotation/byfontstyle", checkObjectIdParams, async (req, res) => {
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);
        if (!set) {
            throw new HTTPError(404);
        }

        const annotation = await models.Annotation.findById(req.params.ObjectId_annotation);

        if (!annotation) {
            throw new HTTPError(404);
        }

        const parsedAnnotationProperties = JSON.parse(annotation.properties);

        let text = null;
        if (parsedAnnotationProperties.data.hasOwnProperty("text")) {
            text = parsedAnnotationProperties.data.text;
        }

        const requestBody = {
            documentID: set.documentID,
            regionOfInterest: {
                pageNumber: annotation.pageNumber,
                x: parsedAnnotationProperties.data.x,
                y: parsedAnnotationProperties.data.y,
                width: parsedAnnotationProperties.data.width,
                height: parsedAnnotationProperties.data.height
            }
        };



        const response = await fetch(AUTOANNOTATOR_URL + "/api/byfontstyle", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        const newAnnotations = [];
        for (let newAnnotation of result) {
            const data = {
                x: newAnnotation.x,
                y: newAnnotation.y,
                width: newAnnotation.width,
                height: newAnnotation.height
            };

            if (text) {
                data.text = text;
            }

            newAnnotations.push(new models.Annotation({
                setID: set._id,
                labelID: annotation.labelID,
                pageNumber: newAnnotation.pageNumber,
                properties: JSON.stringify({
                    type: parsedAnnotationProperties.type,
                    data: data
                })
            }).save());
        }

        await Promise.all(newAnnotations);
        res.status(200).send("ok");
    }
    catch (e) {
        handleError(res, e);
    }
});

router.get("/:ObjectId_set/annotations/:ObjectId_annotation/bypage", checkObjectIdParams, async (req, res) => {
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);
        if (!set) {
            throw new HTTPError(404);
        }

        const annotation = await models.Annotation.findById(req.params.ObjectId_annotation);

        if (!annotation) {
            throw new HTTPError(404);
        }

        const parsedAnnotationProperties = JSON.parse(annotation.properties);

        let text = null;
        if (parsedAnnotationProperties.data.hasOwnProperty("text")) {
            text = parsedAnnotationProperties.data.text;
        }


        const requestBody = {
            documentID: set.documentID,
            mode: req.query.mode,
            regionOfInterest: {
                pageNumber: annotation.pageNumber,
                x: parsedAnnotationProperties.data.x,
                y: parsedAnnotationProperties.data.y,
                width: parsedAnnotationProperties.data.width,
                height: parsedAnnotationProperties.data.height
            }
        };

        const response = await fetch(AUTOANNOTATOR_URL + "/api/bypage", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        const newAnnotations = [];
        for (let newAnnotation of result) {
            const data = {
                x: newAnnotation.x,
                y: newAnnotation.y,
                width: newAnnotation.width,
                height: newAnnotation.height
            };

            if (text) {
                data.text = text;
            }

            newAnnotations.push(new models.Annotation({
                setID: set._id,
                labelID: annotation.labelID,
                pageNumber: newAnnotation.pageNumber,
                properties: JSON.stringify({
                    type: parsedAnnotationProperties.type,
                    data: data
                })
            }).save());
        }

        await Promise.all(newAnnotations);
        res.status(200).send("ok");
    }
    catch (e) {
        handleError(res, e);
    }
});


router.get("/:ObjectId_set/labels", checkObjectIdParams, async (req, res) => {
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);

        if (!set) {
            throw new HTTPError(404);
        }

        const labels = await models.Label.find({setID: set._id});

        const result = [];

        for (let label of labels) {
            result.push({
                id: label._id,
                setID: label.setID,
                name: label.name,
                color: label.color
            });
        }

        res.json(result);
    }
    catch (e) {
        handleError(res, e);
    }
});

router.post("/:ObjectId_set/labels", checkObjectIdParams, async (req, res) => {
    if (!req.body.hasOwnProperty("name")) {
        new HTTPError(400).send(res);
        return;
    }

    if (!req.body.hasOwnProperty("color")) {
        new HTTPError(400).send(res);
        return;
    }

    if (req.body.name.length === 0) {
        new HTTPError(400, "Name must not be empty").send(res);
        return;
    }
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set)
        if (!set) {
            throw new HTTPError(404);
        }

        const existingLabels = await models.Label.find({setID: set._id, name: req.body.name});

        if (!existingLabels || existingLabels.length !== 0) {
            throw new HTTPError(400, "Labels must have a unique name");
        }

        const label = new models.Label({
            setID: set._id,
            name: req.body.name,
            color: req.body.color,
        });

        const savedLabel = await label.save();
        const location = `/api/annotationsets/${savedLabel.setID}/labels/${savedLabel._id}`;
        res.location(location);
        res.status(201).send();
    }
    catch (e) {
        handleError(res, e);
    }
});

router.delete("/:ObjectId_set/labels/:ObjectId_label", checkObjectIdParams, async (req, res) => {
    try {
        const set = await models.AnnotationSet.findById(req.params.ObjectId_set);
            if (!set) {
                throw new HTTPError(404);
            }

            const label = await models.Label.findById(req.params.ObjectId_label)
            if (!label) {
                res.status(404).send("Not found");
                return;
            }

            const annotations = await models.Annotation.find({setID: set._id, labelID: label._id});
            console.log(annotations);
            if (!annotations || annotations.length !== 0) {
                throw new HTTPError(400, `Label is still used by ${annotations.length} annotations`);
            }

            await label.remove();
            res.status(200).send();

    }
    catch (e) {
        handleError(res, e);
    }
});


module.exports = router;