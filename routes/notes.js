var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Student     = require("../models/student"),
    Note        = require("../models/note");
    
router.get("/new", function(req,res){
    Student.findById(req.params.id, function(err, foundStudent){
        if (err){
            console.log("There is an error: " + err);
            req.flash("error", "ERROR");
            res.redirect("/students/" + req.params.id);
        } else {
            res.render("notes/new", {student: foundStudent});
        }
    });
});

router.post("/", function(req,res){
    Student.findById(req.params.id, function(err,foundStudent){
        if (err){
            console.log("There is an error!");
            req.flash("error", "ERROR");
            res.redirect("/students/" + req.params.id);
        } else {
            Note.create(req.body.note, function(err,note){
                if (err){
                    req.flash("error", "ERROR creating note");
                } else {
                    note.author.id = req.user._id;
                    note.author.username = req.user.username;
                    note.save();
                    console.log("The note is: \n" + note);
                    foundStudent.notes.push(note);
                    foundStudent.save(function(err, savedStudent){
                        if (err){
                            console.log("cannot save!");
                            req.flash("error", "ERROR");
                            res.redirect("/students/" + req.params.id);
                        } else {
                            console.log("Success! The student is: \n" + savedStudent);
                            req.flash("success", "Note successfully created!");
                            res.redirect("/students/" + req.params.id);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;