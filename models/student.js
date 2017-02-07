var mongoose = require("mongoose");
var studentSchema = mongoose.Schema({
    name: {
        first: {type: String, trim: true},
        last: {type: String, trim: true}
    },
    grade: Number,
    learning_goal: String,
    // Each students will have a list of entries
    entries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Entry"
        }
    ],
    
    // Each student will have a list of notes
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note"
        }
    ],
    
    // Each student will have a list of courses that he/she is taking
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ]
});

studentSchema.virtual("fullName").get(function(){
    // return this; // this refers to the current instance of the model that we are working on
    return this.name.first + " " + this.name.last;
});

module.exports = mongoose.model("Student", studentSchema);