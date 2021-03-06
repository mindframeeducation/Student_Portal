var express = require("express"),
    router = express.Router({
        mergeParams: true
    }),
    Student = require("../models/student"),
    Note = require("../models/note");
var middlewareObj = require("../middleware");

// CREATING A NEW NOTE
router.get("/new", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findById(req.params.id, function(err, foundStudent) {
        if (err) {
            req.flash("error", "ERROR");
            res.redirect("/students/" + req.params.id);
        }
        else {
            res.render("notes/new", {
                student: foundStudent
            });
        }
    });
});

router.post("/", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findById(req.params.id, function(err, foundStudent) {
        if (err) {
            req.flash("error", "ERROR");
            res.redirect("/students/" + req.params.id);
        }
        else {
            Note.create(req.body.note, function(err, note) {
                if (err) {
                    req.flash("error", "ERROR creating note");
                }
                else {
                    note.author.id = req.user._id;
                    note.author.username = req.user.username;
                    note.save();
                    console.log("The note is: \n" + note);
                    foundStudent.notes.push(note);
                    foundStudent.save(function(err, savedStudent) {
                        if (err) {
                            req.flash("error", "ERROR");
                            res.redirect("/students/" + req.params.id);
                        }
                        else {
                            req.flash("success", "Note successfully created!");
                            res.redirect("/students/" + req.params.id);
                        }
                    });
                }
            });
        }
    });
});

router.get("/", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findById(req.params.id).populate({
        path: 'notes',
        options: {
            sort: {
                created: -1
            }
        }
    }).exec(function(err, foundStudent) {
        if (err) {
            req.flash("error", "ERROR LOOKING UP STUDENT");
            res.redirect("/students/" + req.params.id);
        }
        else {
            res.render("notes/index", {
                foundStudent: foundStudent
            });
        }
    });
});

// UPDATE ROUTES FOR NOTE
router.get("/:note_id/edit", middlewareObj.isLoggedIn, middlewareObj.checkNoteOwnership, function(req, res) {
    Note.findById(req.params.note_id, function(err, foundNote) {
        if (err) {
            req.flash("error", "Notes cannot be found");
            res.redirect("back");
        }
        else {
            res.render("notes/edit", {
                note: foundNote,
                student_id: req.params.id
            });
        }
    });
});

router.put("/:note_id", middlewareObj.isLoggedIn, middlewareObj.checkNoteOwnership, function(req, res) {
    Note.findByIdAndUpdate(req.params.note_id, req.body.note, function(err, updatedNote) {
        if (err) {
            req.flash("error", "Error updating note");
            res.redirect("back");
        }
        else {
            req.flash("success", "Note updated successfully");
            res.redirect("/students/" + req.params.id + "/notes");
        }
    });
});

// DELETE NOTE ROUTE
router.delete("/:note_id", middlewareObj.isLoggedIn, middlewareObj.checkNoteOwnership, function(req, res) {
    Note.findByIdAndRemove(req.params.note_id, function(err) {
        if (err) {
            req.flash("error", "Can't delete note");
            res.redirect("back");
        }
        else {
            Student.findByIdAndUpdate(req.params.id, {
                $pull: {
                    notes: req.params.note_id
                }
            }, function(err, data) {
                if (err) {
                    req.flash("error", "No note found");
                    res.redirect("back");
                }
                else {
                    req.flash("success", "Note successfully removed");
                    res.redirect("/students/" + req.params.id + "/notes");
                }
            });
        }
    });
});

module.exports = router;
