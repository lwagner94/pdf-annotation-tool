const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    _id: String,
    userID: mongoose.Schema.Types.ObjectId,
    name: String,
    mimeType: String,
    size: Number
});

const Document = mongoose.model("Document", documentSchema);

module.exports.Document = Document;