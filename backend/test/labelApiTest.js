const request = require("supertest");
const mongoose = require("mongoose");
const models = require("../db/models");
const itParam = require("mocha-param");

const util = require("./util");

const should = require("chai").should();


function getLabelID(response) {
    return response.headers.location.split("/")[5];
}


describe("Label API", function () {
    let server;
    let documentID;
    let annotationSetID;
    let path;

    beforeEach(async function () {
        server = util.createServer();
        documentID = (await util.uploadTestDocument(server)).headers.location.split("/")[3];
        annotationSetID = (await util.addAnnotationSet(server, documentID)).headers.location.split("/")[3];
        path = `/api/annotationsets/${annotationSetID}/labels/`;
    });
    afterEach(function () {
        server.close();
        models.Document.deleteMany({}).exec();
        models.AnnotationSet.deleteMany({}).exec();
        models.Annotation.deleteMany({}).exec();
        models.Label.deleteMany({}).exec();
        util.cleanupFiles();
    });

    it("should not list any labels for a new annotation set", function (done) {
        request(server)
            .get(path)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect([], done);
    });

    it("should return '404 Not found' for an unknown annotation set", function (done) {
        request(server)
            .get("/api/annotationsets/aaaaaaaaaaaaaaaaaaaaaaaa/annotations")
            .expect(404, done);
    });


    itParam("should return '404 Not found' for malformed/unknown IDs", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaa"], function (done, value) {
        util.addAnnotation(server, annotationSetID)
            .then(() => {
                request(server)
                    .get(path + value)
                    .expect(404)
                    .then(() => {
                        done();
                    })

            });
    });

    it("should be possible to create a new label", function (done) {
        util.addLabel(server, annotationSetID)
            .then(response => {
                response.headers.location.should.match(/api\/annotationsets\/.{24}\/labels\/.{24}/);
                done();
            });
    });

    it("should be possible to delete created label", function (done) {
        util.addLabel(server, annotationSetID)
            .then(response => {
                const labelID = getLabelID(response);
                request(server)
                    .delete(path + labelID)
                    .expect(200)
                    .then(() => {
                        done();
                    })
            });
    });
});