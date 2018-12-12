const request = require("supertest");
const mongoose = require("mongoose");
const models = require("../db/models");

const util = require("./util");

const should = require("chai").should();


describe("Document API", function () {
    let server;
    beforeEach(function () {
        server = util.createServer();

    });
    afterEach(function () {
        server.close();
        models.Document.deleteMany({}).exec();
        util.cleanupFiles();
    });

    it("should be possible to upload documents", function(done) {
         util.uploadTestDocument(server).then(response => {
             response.headers.location.should.match(/api\/documents\/.*/);
             done();
         });
    });

    it("should be possible to get uploaded documents", function(done) {
        util.uploadTestDocument(server).then(response => {
            request(server)
                .get(response.headers.location)
                .expect("Content-Type", "application/pdf")
                .expect(200, done);
        });
    });

    it("should return '404 Not Found' for documents that do not exist", function(done) {
        request(server)
            .get("/api/documents/invalid")
            .expect(404, done);
    });

    it("should not be possible to get non-existing documents", function(done) {
        request(server)
            .delete("/api/documents/abcd")
            .expect(404, done);
    });

    it("should not list any documents when none are uploaded", function(done) {
        request(server)
            .get("/api/documents")
            .expect("Content-Type", /json/)
            .expect(200)
            .expect([], done);
    });


    it("should be possible to list all documents", function(done) {
        util.uploadTestDocument(server)
            .then(response => {
                const location = response.headers.location;
                request(server)
                    .get("/api/documents")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then(response => {
                        response.body.should.have.lengthOf(1);
                        const document = response.body[0];

                        document.name.should.equal("test.pdf");
                        document.id.should.equal(location.split("/")[3]);
                        done();
                    });
            })
    });

    it("should be able to delete uploaded documents", function(done) {
        util.uploadTestDocument(server)
            .then(response => {
                request(server)
                    .delete(response.header.location)
                    .expect(200, done);
            });
    });

    it("should not be possible to delete non-existing documents", function(done) {
        request(server)
            .delete("/api/documents/abcd")
            .expect(404, done);
    });
});