var mongoose = require("mongoose");

var emailListSchema = mongoose.Schema({
    name: String,
    emails: [String]
});

module.exports = mongoose.model("EmailList", emailListSchema);