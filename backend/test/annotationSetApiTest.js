const request = require("supertest");
const mongoose = require("mongoose");
const models = require("../db/models");
const itParam = require("mocha-param");

const util = require("./util");

const should = require("chai").should();


describe("AnnotationSet API", function () {
    let server;
    let documentID;
    beforeEach(async function () {
        server = util.createServer();
        documentID = (await util.uploadTestDocument(server)).headers.location.split("/")[3];

    });
    afterEach(function () {
        server.close();
        models.Document.deleteMany({}).exec();
        models.AnnotationSet.deleteMany({}).exec();
        util.cleanupFiles();
    });

    it("should not list any AnnotationSets when none are added", function (done) {
        request(server)
            .get("/api/annotationsets")
            .expect(200)
            .expect([], done);
    });

    it("should be possible to add AnnotationSets", function(done) {
        util.addAnnotationSet(server, documentID)
            .then(response => {
                response.headers.location.should.match(/api\/annotationsets\/.*/);
                done();
            });
    });

    it("should return '400 Bad Request' if the document ID is invalid", function(done) {
        request(server)
            .post("/api/annotationsets")
            .send({
                documentID: "invalid"
            })
            .expect(400, done);
    });

    it("should return '400 Bad Request' when document ID is missing", function(done) {
        request(server)
            .post("/api/annotationsets")
            .expect(400, done);
    });

    it("should be possible to retrieve created AnnotationSet", function(done) {
        util.addAnnotationSet(server, documentID)
            .then(response => {
                const id = response.headers.location.split("/")[3];
                request(server)
                    .get("/api/annotationsets")
                    .expect(200)
                    .then(response => {
                        response.body.should.have.lengthOf(1);
                        const set = response.body[0];
                        set.id.should.equal(id);
                        done();
                    });

            });
    });

    it("should be possible to retrieve created AnnotationSet via ID", function(done) {
        util.addAnnotationSet(server, documentID)
            .then(response => {
                const id = response.headers.location.split("/")[3];
                request(server)
                    .get("/api/annotationsets/" + id)
                    .expect(200)
                    .then(response => {
                        response.body.id.should.equal(id);
                        done();
                    });

            });
    });

    it("should be possible to delete an AnnotationSet", function(done) {
        util.addAnnotationSet(server, documentID)
            .then(response => {
                const id = response.headers.location.split("/")[3];
                request(server)
                    .delete("/api/annotationsets/" + id)
                    .expect(200, done);
            });
    });


    itParam("should return '404 Not found' for malformed/unknown IDs", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaa"], function(done, value) {
        request(server)
            .get("/api/annotationsets/" + value)
            .expect(404, done);
    });

    itParam("should return '404 Not found' for malformed/unknown IDs", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaa"], function(done, value) {
        request(server)
            .delete("/api/annotationsets/" + value)
            .expect(404, done);
    });

});