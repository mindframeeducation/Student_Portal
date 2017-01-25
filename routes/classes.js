var express = require("express");
var router = express.Router({mergeParams: true});
var ClassList = require("../models/classList");

// Route to show all classes
router.get("/classes",isAuthorized, function(req,res){
    ClassList.findOne({name: "All"}, function(err, classList){
        if (err){
            console.log("Cannot find class list: " + err);
        } else {
            res.render("classes/index.ejs", {classList: classList});
        }
    });
});

// Route to add a new class
router.post("/classes", isAuthorized, function(req,res){
    ClassList.findOne({name: "All"}, function(err, classList){
        if (err){
            console.log("There is an error: " + err);
        } else {
            classList.allClasses.push(req.body.class);
            classList.save();
            req.flash("success", req.body.class + " added to class list");
            res.redirect("/classes");
        }
    });
});

// Route to delete a class
router.delete("/classes/:className", isAuthorized, function(req,res){
    ClassList.findOne({name: "All"}, function(err, classList){
        if (err){
            console.log("There is an error : " + err);
        } else {
            var pos = classList.allClasses.indexOf(req.params.className);
            if (pos > -1){
                classList.allClasses.splice(pos, 1);
                classList.save();
                req.flash("success", req.params.className + " successfully removed!");
                res.redirect("/classes");
            } else {
                req.flash("error", "Class does not exist in db");
                res.redirect("/classes");
            }
        }
    });
});

function isAuthorized(req,res,next){
    if (req.isAuthenticated()){
        if (req.user.hasAccess('admin')) {
            next();
        } else {
            req.flash("error", "You do not have permission!");
            res.redirect("back");
        }
    } else {
        req.flash("error", "Please log in first!");
        res.redirect("/login");
    }
}

module.exports = router;