const request = require("supertest");
const mongoose = require("mongoose");
const models = require("../db/models");
const fs = require("fs");
const path = require("path");
const should = require("chai").should();




function cleanupFiles() {
    fs.readdir("files-test", (err, files) => {
        if (err) throw err;

        for (const file of files) {
            if (file === ".gitkeep")
                continue;

            fs.unlink(path.join("files-test", file), err => {
                if (err) throw err;
            });
        }
    });
}

function createServer() {
    const app = require("../app");
    return app.listen(3001);
}

describe("Test document API", function () {
    let server;
    beforeEach(function () {
        server = createServer();

    });
    afterEach(function () {
        server.close();
        models.Document.deleteMany({}).exec();
        cleanupFiles();
    });

    it("test upload document", done => {
         request(server)
             .post("/api/documents/")
             .attach("pdf", "test/documents/test.pdf")
             .expect(201, done);
    });

    it("test list documents", done => {
        request(server)
            .post("/api/documents/")
            .attach("pdf", "test/documents/test.pdf")
            .expect(201)
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

    it("test delete document", done => {
        request(server)
            .post("/api/documents/")
            .attach("pdf", "test/documents/test.pdf")
            .expect(201)
            .then(response => {
                request(server)
                    .delete(response.header.location)
                    .expect(200, done);
            });
    });
});