const request = require("supertest");
const mongoose = require("mongoose");
const models = require("../db/models");
const itParam = require("mocha-param");

const util = require("./util");

const should = require("chai").should();


function getAnnotationID(response) {
    return response.headers.location.split("/")[5];
}


describe("AnnotationSet API", function () {
    let server;
    let documentID;
    let annotationSetID;
    let path;

    beforeEach(async function () {
        server = util.createServer();
        documentID = (await util.uploadTestDocument(server)).headers.location.split("/")[3];
        annotationSetID = (await util.addAnnotationSet(server, documentID)).headers.location.split("/")[3];
        path = `/api/annotationsets/${annotationSetID}/annotations/`;
    });
    afterEach(function () {
        server.close();
        models.Document.deleteMany({}).exec();
        models.AnnotationSet.deleteMany({}).exec();
        models.Annotation.deleteMany({}).exec();
        util.cleanupFiles();
    });

    it("should not list any annotations for a new annotation set", function (done) {
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

    it("should be possible to create a new annotation", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                response.headers.location.should.match(/api\/annotationsets\/.*/);
                done();
            });
    });

    it("should return '400 Bad Request' when pageNumber missing", function (done) {
        request(server)
            .post(`/api/annotationsets/${annotationSetID}/annotations/`)
            .send({
                properties: "test"
            })
            .expect(400, done);
    });

    it("should return '400 Bad Request' when properties missing", function (done) {
        request(server)
            .post(`/api/annotationsets/${annotationSetID}/annotations/`)
            .send({
                pageNumber: 10
            })
            .expect(400, done);
    });


    it("should return '404 Not Found' for invalid set id", function(done) {
        request(server)
            .post(`/api/annotationsets/aaaaaaaaaaaaaaaaaaaaaaaa/annotations/`)
            .send({
                pageNumber: 1,
                properties: "test",
                labelID: "aaaaaaaaaaaaaaaaaaaaaaaa"
            })
            .expect(404, done)
    });

    it("should be possible to list newly created annotation", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(() => {
                request(server)
                    .get(path)
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .then(response => {
                        response.body.should.have.lengthOf(1);
                        done();
                    })
            });
    });

    it("should be possible to get newly created annotation", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                const annotationID = getAnnotationID(response);
                request(server)
                    .get(path + annotationID)
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .then(response => {
                        response.body.setID.should.equal(annotationSetID);
                        response.body.pageNumber.should.equal(1);
                        response.body.properties.should.equal("test");
                        done();
                    })
            });
    });

    it("should return '404 Not Found' for invalid set id", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                const annotationID = getAnnotationID(response);
                request(server)
                    .get("/api/annotationsets/aaaaaaaaaaaaaaaaaaaaaaaa/annotations/" + annotationID)
                    .expect(404, done)
            });
    });


    it("should be possible to delete created annotation", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                const annotationID = getAnnotationID(response);
                request(server)
                    .delete(path + annotationID)
                    .expect(200)
                    .then(() => {
                        done();
                    })
            });
    });

    it("should be possible to modify created annotation", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                const annotationID = getAnnotationID(response);
                request(server)
                    .put(path + annotationID)
                    .send({
                        pageNumber: 10,
                        properties: "modified",
                        labelID: "aaaaaaaaaaaaaaaaaaaaaaaa"
                    })
                    .expect(200)
                    .then(response => {
                        response.headers.location.should.equal(path + annotationID);

                        request(server)
                            .get(path + annotationID)
                            .expect(200)
                            .then(response => {
                                response.body.pageNumber.should.equal(10);
                                response.body.properties.should.equal("modified");
                                response.body.setID.should.equal(annotationSetID);
                                done();
                            });
                    })
            });
    });

    it("should return '400 Bad Request' when properties missing", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                const annotationID = getAnnotationID(response);
                request(server)
                    .put(path + annotationID)
                    .send({
                        pageNumber: 10,
                    })
                    .expect(400, done)
            });
    });

    it("should return '400 Bad Request' when pageNumber missing", function (done) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                const annotationID = getAnnotationID(response);
                request(server)
                    .put(path + annotationID)
                    .send({
                        properties: "modified",
                    })
                    .expect(400, done)
            });
    });

    itParam("should return '404 Not found' when modifying via a non existent/malformed annotation ID", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaa"], function (done, value) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                request(server)
                    .put(path + value)
                    .send({
                        pageNumber: 10,
                        properties: "modified",
                        labelID: "aaaaaaaaaaaaaaaaaaaaaaaa"
                    })
                    .expect(404)
                    .then(() => {
                        done();
                    })
            });
    });

    itParam("should return '404 Not found' when modifying via a non-existent set ID", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaa"], function (done, value) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                request(server)
                    .put(`/api/annotationsets/${value}/annotations/aaaaaaaaaaaaaaaaaaaaaaaa`)
                    .send({
                        pageNumber: 10,
                        properties: "modified",
                        labelID: "aaaaaaaaaaaaaaaaaaaaaaaa"
                    })
                    .expect(404)
                    .then(() => {
                        done();
                    })
            });
    });

    itParam("should return '404 Not found' when deleting a non existent/malformed annotation ID", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaa"], function (done, value) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                request(server)
                    .delete(path + value)
                    .expect(404)
                    .then(() => {
                        done();
                    })
            });
    });

    itParam("should return '404 Not found' when deleting from a non-existent set ID ${value}", ["aaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaa"], function (done, value) {
        util.addAnnotation(server, annotationSetID)
            .then(response => {
                request(server)
                    .delete(`/api/annotationsets/${value}/annotations/aaaaaaaaaaaaaaaaaaaaaaaa`)
                    .expect(404)
                    .then(() => {
                        done();
                    })
            });
    });


});