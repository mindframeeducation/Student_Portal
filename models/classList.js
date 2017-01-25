var mongoose = require("mongoose");

var classListSchema = mongoose.Schema({
    name: String,
    allClasses: [String]
});

module.exports = mongoose.model("ClassList", classListSchema);