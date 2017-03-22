var mongoose = require("mongoose");
var commentSchema = mongoose.Schema({
    text: String,
    author: {
        username: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Comment", commentSchema);