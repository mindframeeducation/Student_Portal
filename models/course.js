var mongoose = require("mongoose");
var courseSchema = mongoose.Schema({
    name: String,
    units: [
        {
            name: String,
            completed: Boolean
        }
    ]
});

module.exports = mongoose.model("Course", courseSchema);