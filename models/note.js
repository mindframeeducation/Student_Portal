var mongoose = require("mongoose");
var noteSchema = mongoose.Schema({
    body: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Note", noteSchema); // Export noteSchema under the name of Note
