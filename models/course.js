var mongoose = require("mongoose");
var courseSchema = mongoose.Schema({
    name: String,
    template: Boolean,
    units: [
        {
            name: String,
            completed: Boolean
        }
    ]
});

// A virtual field (progress) that keeps track of the current course's progress
courseSchema.virtual("progress").get(function(){
    var total = this.units.length;
    var completed = 0;
    for (var i = 0; i < this.units.length; i++){
        if (this.units[i].completed) {
            completed++;
        }
    }
    return completed/total*100;
});

module.exports = mongoose.model("Course", courseSchema);