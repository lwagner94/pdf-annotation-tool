const fs = require("fs");
const bodyParser = require("body-parser");
const documentsRouter = require("./documentApi");
const annotationsetRouter = require("./annotationsetApi");

const mongoose = require("mongoose");
const express = require("express");
const models = require("../db/models");

const router = express.Router();

mongoose.connect("mongodb://localhost/pdfannotationtool");

router.use('/documents', documentsRouter);
router.use('/annotationsets', annotationsetRouter);

module.exports = router;