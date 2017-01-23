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
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note"
        }
    ]
});

module.exports = mongoose.model("Student", studentSchema);