const fs = require("fs");
const path = require("path");
const request = require("supertest");


module.exports.cleanupFiles = function () {
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
};

module.exports.createServer = function () {
    const app = require("../app");
    return app.listen(3001);
};

module.exports.uploadTestDocument = function (server) {
    return request(server)
        .post("/api/documents/")
        .attach("pdf", "test/documents/test.pdf")
        .expect(201);
};

module.exports.addAnnotationSet = function (server, documentID) {
    return request(server)
        .post("/api/annotationsets")
        .send({
            documentID: documentID
        })
        .expect(201)
};

module.exports.addAnnotation = function (server, annotationSetID) {
    return request(server)
        .post(`/api/annotationsets/${annotationSetID}/annotations/`)
        .send({
            pageNumber: 1,
            properties: "test"
        })
        .expect(201)
};
