var express = require("express");
var router = express.Router({mergeParams: true});
var ClassList = require("../models/classList");

// Route to show all classes
router.get("/classes", function(req,res){
    ClassList.findOne({name: "All"}, function(err, classList){
        if (err){
            console.log("Cannot find class list: " + err);
        } else {
            res.render("classes/index.ejs", {classList: classList});
        }
    });
});

// Route to add a new class
router.post("/classes", function(req,res){
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
router.delete("/classes/:className", function(req,res){
    ClassList.findOne({name: "All"}, function(err, classList){
        if (err){
            console.log("There is an error : " + err);
        } else {
            var pos = classList.allClasses.indexOf(req.params.className);
            if (pos > -1){
                classList.allClasses.splice(pos, 1);
                classList.save();
                req.flash("success", req.params.className + " removed successfully");
                res.redirect("/classes");
            } else {
                req.flash("error", "Class does not exist in db");
                res.redirect("/classes");
            }
        }
    })
})



module.exports = router;