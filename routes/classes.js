var express = require("express");
var router = express.Router({
    mergeParams: true
});
var ClassList = require("../models/classList");
var middlewareObj = require("../middleware");

// Route to show all classes
router.get("/classes", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    ClassList.findOne({
        name: "All"
    }, function(err, classList) {
        if (err) {
            req.flash("error", "Error. Please try again");
            res.redirect("back");
        }
        else {
            res.render("classes/index", {
                classList: classList
            });
        }
    });
});

// Route to add a new class
router.post("/classes", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    ClassList.findOne({
        name: "All"
    }, function(err, classList) {
        if (err) {
            console.log("There is an error: " + err);
            req.flash("error", "Error adding a new class");
            res.redirect("back");
        }
        else {
            classList.allClasses.push(req.body.class);
            classList.save();
            req.flash("success", "Added " + "\'" + req.body.class + "\'");
            res.redirect("/classes");
        }
    });
});

// Route to delete a class
router.delete("/classes/:className", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    ClassList.findOne({
        name: "All"
    }, function(err, classList) {
        if (err) {
            console.log("There is an error : " + err);
            req.flash("error", "Error. Please try again");
            res.redirect("back");
        }
        else {
            var pos = classList.allClasses.indexOf(req.params.className);
            if (pos > -1) {
                classList.allClasses.splice(pos, 1);
                classList.save();
                req.flash("success", "Removed " + "\'" + req.params.className + "\'");
                res.redirect("/classes");
            }
            else {
                req.flash("error", "Class does not exist in db");
                res.redirect("/classes");
            }
        }
    });
});

// function isAuthorized(req,res,next){
//     if (req.isAuthenticated()){
//         if (req.user.hasAccess('user')) {
//             next();
//         } else {
//             req.flash("error", "You do not have permission!");
//             res.redirect("back");
//         }
//     } else {
//         req.flash("error", "Please log in first!");
//         res.redirect("/login");
//     }
// }
module.exports = router;
