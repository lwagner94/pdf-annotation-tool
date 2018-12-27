
class HTTPError {
    constructor(code, message) {
        this.code = code;
        if (message) {
            this.message = message;
        }
        else this.message = null;


        switch (this.code) {
            case 400: this.name = "Bad Request"; break;
            case 404: this.name = "Not Found"; break;
        }
    }

    send(res) {
        if (this.message) {
            res.status(this.code).json({error: this.message});
        }
        else {
            res.status(this.code).json({error: this.name});
        }
    }
}


function handleError(res, err) {
    if (err instanceof HTTPError) {
        err.send(res);
    }
    else {
        console.log(err);
        res.status(500).json({error: "Internal server error"})
    }
}

module.exports.HTTPError = HTTPError;
module.exports.handleError = handleError;