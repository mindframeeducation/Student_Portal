var mongoose = require("mongoose");
var entrySchema = mongoose.Schema({
    class_name: String,
    summary: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: { type: Date, default: Date.now}
});

module.exports = mongoose.model("Entry", entrySchema);