var express     = require("express"),
    router      = express.Router(),
    Student     = require("../models/student"),
    mongoose    = require("mongoose"),
    User        = require("../models/user");
    
router.get("/parents", isAuthorized, function(req,res){
    User.find().populate("students").exec(function(err, parents){
        if (err){
            console.log("There is an error");
            req.flash("error", "User lookup failed");
            res.redirect("/students");
        } else {
            res.render("parents/index", {parents: parents});
        }
    });
    
});

router.get("/parents/:id/students", isAuthorized, function(req,res){
    User.findById(req.params.id).populate("students").exec(function(err, parent){
        if (err){
            
        } else {
            res.render("parents/show", {parent: parent});
        }
    });
});

// Routes to add student to a parent
router.get("/parents/:id/students/new", isAuthorized, function(req,res){
    Student.find({}, function(err, students){
        if (err){
            req.flash("error", "There is an error");
            res.redirect("/parents");
        } else {
            User.findById(req.params.id, function(err, parent){
                if (err){
                    req.flash("error", "Error looking up parent");
                    res.redirect("/parents");
                } else {
                    res.render("parents/add-student", {students: students, parent: parent});
                }
            });
        }
    });
});

router.post("/parents/:id/students", isAuthorized, function(req,res){
    User.findById(req.params.id, function(err, parent){
        if (err){
            req.flash("error", "Error looking up parent");
            res.redirect("/parents");
        } else {
            var student_id = mongoose.Types.ObjectId(req.body.student_id);
            if (parent.students){ // if there is a student list
                parent.students.push(student_id);
                parent.save();
                req.flash("student added to parent successfully!");
                res.redirect("/parents/" + req.params.id + "/students");
            } else {
                parent.students = [{type: mongoose.Schema.Types.ObjectId,ref: "Student"}];
                parent.students.push(student_id);
                parent.save();
                req.flash("student added to parent!");
                res.redirect("/parents/" + req.params.id + "/students");
            }
        }
    });
});

router.delete("/parents/:id/students/:student_id", isAuthorized, function(req,res){
    User.findByIdAndUpdate(req.params.id, {$pull: {students: req.params.student_id}}, function(err, updatedUser){
        if (err){
            req.flash("error", "Error removing student");
            return res.redirect("/parents");
        } 
        req.flash("success", "Successfully removed student!");
        res.redirect("/parents/" + req.params.id + "/students");
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