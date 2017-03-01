var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Entry = require("../models/entry");
var Student = require("../models/student");
var ClassList = require("../models/classList");
var middlewareObj = require("../middleware");
var Course = require("../models/course");

// The order of routes actually matters. If I put this NEW route before the show route,
// it works, but not the other way around
// Create new entry (GET request)
router.get("/new", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findById(req.params.id, function(err, foundStudent) {
        if (err) {
            console.log("Error " + err);
            req.flash("error", "Error. Please try again");
            res.redirect("back");
        }
        else {
            Course.find({
                template: true
            }, function(err, courses) {
                if (err) {
                    console.log("There is an error");
                    req.flash("error", "Error. Please try again");
                    res.redirect("back");
                }
                else {
                    res.render("entries/new", {
                        foundStudent: foundStudent,
                        courses: courses
                    });
                }
            });
        }
    });
});


// Route to show a specific entry
router.get("/:entry_id", middlewareObj.isLoggedIn, function(req, res) {
    Entry.findById(req.params.entry_id, function(err, foundEntry) {
        if (err) {
            console.log("No such entry found: " + err);
            req.flash("error", "Err. Please try again");
            res.redirect("back");
        }
        else {
            res.render("entries/show", {
                student_id: req.params.id,
                entry: foundEntry
            });
        }
    });
});


// 
// Create new entry (POST request)
router.post("/", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    if (!req.body.entry.class_name) {
        req.flash("error", "Please choose a class");
        return res.redirect("back");
    }
    if (!req.body.entry.summary) {
        req.flash("error", "Please fill in the summary");
        return res.redirect("back");
    }
    Student.findById(req.params.id, function(err, foundStudent) {
        if (err) {
            console.log(err);
            req.flash("error", "Error. Please try again");
            res.redirect("/blogs");
        }
        else {
            Entry.create(req.body.entry, function(err, entry) {
                if (err) {
                    console.log("there is an error creating the entry for this student");
                    req.flash("error", "Please try again");
                    res.redirect("back");
                }
                else {
                    console.log("Entry created successfully!");
                    entry.author.id = req.user._id;
                    entry.author.username = req.user.username;
                    entry.save(); // save the created entry to the database
                    foundStudent.entries.push(entry);
                    foundStudent.save(); // save the student
                    req.flash("success", "Entry successfully created!");
                    res.redirect("/students/" + foundStudent._id);
                }
            });
        }
    });
});

// EDIT ROUTE (SHOW PAGE)
router.get("/:entry_id/edit", middlewareObj.isLoggedIn, middlewareObj.checkEntryOwnership, function(req, res) {
    Entry.findById(req.params.entry_id, function(err, foundEntry) {
        if (err) {
            console.log("There is an error looking for the entry: " + err);
            req.flash("error", "Please try again");
            res.redirect("back");
        }
        else {
            res.render("entries/edit", {
                student_id: req.params.id,
                entry: foundEntry
            });
        }
    });
});

// EDIT ROUTE (PUT REQUEST)
router.put("/:entry_id", middlewareObj.isLoggedIn, middlewareObj.checkEntryOwnership, function(req, res) {
    Entry.findById(req.params.entry_id, function(err, entry) {
        if (err) {
            req.flash("Err: " + err);
            res.redirect("back");
        }
        else {
            entry.summary = req.body.entry.summary;
            if (req.body.entry.class_name.length !== 0) {
                entry.class_name = req.body.entry.class_name;
            }
            entry.save();
            req.flash("success", "Entry updated!");
            res.redirect("back");
        }
    });
});

// DELETE ROUTE
router.delete("/:entry_id", middlewareObj.isLoggedIn, middlewareObj.checkEntryOwnership, function(req, res) {
    Entry.findByIdAndRemove(req.params.entry_id, function(err) {
        if (err) {
            console.log("There is an error trying to remove!");
            req.flash("error", "Error");
            res.redirect("back");
        }
        else {
            Student.findByIdAndUpdate(req.params.id, {
                $pull: {
                    entries: req.params.entry_id
                }
            }, function(err, data) {
                if (err) {
                    console.log("There is an error removing this entry from student's entry array");
                    req.flash("error", "error");
                    res.redirect("back");
                }
                else {
                    req.flash("success", "Entry successfully removed!");
                    res.redirect("/students/" + req.params.id);
                }
            });
        }
    });
});

module.exports = router;
