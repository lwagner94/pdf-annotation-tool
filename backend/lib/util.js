
class HTTPError {
    constructor(code) {
        this.code = code;

        switch (this.code) {
            case 400: this.name = "Bad Request"; break;
            case 404: this.name = "Not Found"; break;
        }
    }

    send(res) {
        res.status(this.code).send(this.name);
    }
}


function handleError(res, err) {
    if (err instanceof HTTPError) {
        res.status(err.code).send(err.name);
    }
    else {
        console.log(err);
        res.status(500).send("Internal server error")
    }
}

module.exports.HTTPError = HTTPError;
module.exports.handleError = handleError;