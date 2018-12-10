const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    _id: String,
    userID: mongoose.Schema.Types.ObjectId,
    name: String,
    size: Number
});

const annotationSetSchema = new mongoose.Schema({
    documentID: String,
    userID: mongoose.Schema.Types.ObjectId,
    locked: Boolean
});

const annotationSchema = new mongoose.Schema({
    setID: mongoose.Schema.Types.ObjectId,
    pageNumber: Number,
    properties: String,
});

module.exports.Document = mongoose.model("Document", documentSchema);
module.exports.AnnotationSet = mongoose.model("AnnotationSet", annotationSetSchema);
module.exports.Annotation = mongoose.model("Annotation", annotationSchema);
