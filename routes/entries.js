var express = require("express");
var router = express.Router({mergeParams: true});
var Entry = require("../models/entry");
var Student = require("../models/student");

// The order of routes actually matters. If I put this NEW route before the show route,
// it works, but not the other way around
// Create new entry (GET request)
router.get("/new", isLoggedIn, isAStaff, function(req,res){
    Student.findById(req.params.id, function(err,foundStudent){
        if (err){
            console.log("Error " + err);
        } else {
            res.render("entries/new", {foundStudent: foundStudent});
        }
    });
});


// Route to show a specific entry
router.get("/:entry_id", isLoggedIn, function(req,res){
    Entry.findById(req.params.entry_id, function(err, foundEntry){
        if (err){
            console.log("No such entry found: " + err);
        } else {
            res.render("entries/show", {student_id: req.params.id, entry: foundEntry});
        }
    });
});


// 
// Create new entry (POST request)
router.post("/", isAStaff, function(req,res){
    Student.findById(req.params.id, function(err, foundStudent){
        if (err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            Entry.create(req.body.entry, function(err, entry){
                if (err){
                    console.log("there is an error creating the entry for this student");
                } else {
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
router.get("/:entry_id/edit", isAuthorized, function(req,res){
   Entry.findById(req.params.entry_id, function(err, foundEntry){
       if (err){
           console.log("There is an error looking for the entry: " + err);
       } else {
           res.render("entries/edit", {student_id: req.params.id, entry: foundEntry});
       }
   }); 
});

// EDIT ROUTE (PUT REQUEST)
router.put("/:entry_id", isAuthorized, function(req,res){
   Entry.findByIdAndUpdate(req.params.entry_id, req.body.entry, function(err, updatedEntry){
       if (err){
           console.log("There is an error updating entry!");
           res.redirect("back");
       } else {
           
           console.log("Successfully updated the entry!");
           req.flash("success", "Entry successfully updated!");
           res.redirect("/students/" + req.params.id);
       }
   });
});

// DELETE ROUTE
router.delete("/:entry_id",isAuthorized, function(req,res){
    Entry.findByIdAndRemove(req.params.entry_id, function(err){
        if (err) {
            console.log("There is an error trying to remove!");
            res.redirect("back");
        } else {
            Student.findByIdAndUpdate(req.params.id,
            {$pull: {entries: req.params.entry_id}}, function(err,data){
                if (err){
                    console.log("There is an error removing this entry from student's entry array");
                } else {
                    req.flash("success", "Entry successfully removed!");
                    res.redirect("/students/" + req.params.id);
                }
            });
        }
    });
});

// Functions
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect("/login");
}

function isAuthorized(req, res, next) {
    if(req.isAuthenticated()){
        Entry.findById(req.params.entry_id, function(err, foundEntry){
            if (err){
                console.log("There is an error looking for a specific blog");
            } else {
                console.log("The found entry is " + foundEntry);
                if (foundEntry.author.id.equals(req.user._id) || req.user.hasAccess("admin")){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("/blogs");
                }
            }
        });
    } else {
        req.flash("error", "Please log in first!");
        res.redirect("back");
    }
}

// Function to check if the user is a staff member
function isAStaff(req,res,next){
    if(req.isAuthenticated()){ // If the user is logged in
        if (req.user.hasAccess('user')){ // If the user is a staff member
            next();
        } else {
            req.flash("error", "Permission denied!");
            res.redirect("/blogs");
        }
    }
}

module.exports = router;