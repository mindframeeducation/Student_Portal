var express     = require("express"),
    router      = express.Router(),
    Student     = require("../models/student"),
    Emails      = require("../models/emailList"),
    mongoose    = require("mongoose"),
    User        = require("../models/user");
    
router.get("/", isAuthorized, function(req,res){
    User.find().populate('students').exec(function(err, parents){
        if (err){
            console.log("There is an error");
            req.flash("error", "User lookup failed");
            res.redirect("/students");
        } else {
            res.render("parents/index", {parents: parents});
        }
    });
    
});

router.get("/:id/students", isAuthorized, function(req,res){
    User.findById(req.params.id).populate("students").exec(function(err, parent){
        if (err){
            
        } else {
            res.render("parents/show", {parent: parent});
        }
    });
});

// Routes to add student to a parent
router.get("/:id/students/new", isAuthorized, function(req,res){
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

router.post("/:id/students", isAuthorized, function(req,res){
    User.findById(req.params.id, function(err, parent){
        if (err){
            req.flash("error", "Error looking up parent");
            res.redirect("/parents");
        } else {
            var student_id = mongoose.Types.ObjectId(req.body.student_id);
            if (parent.students){ // if there is a student list
                if (parent.students.indexOf(student_id) === -1) {
                    parent.students.push(student_id);
                    parent.save();
                    req.flash("success", "Student successfully assigned to parent!");
                    res.redirect("/parents/" + req.params.id + "/students");
                } else {
                    req.flash("error", "Student already assigned to this parent");
                    res.redirect("/parents/" + req.params.id + "/students");
                }
                
            } else {
                parent.students = [{type: mongoose.Schema.Types.ObjectId,ref: "Student"}];
                parent.students.push(student_id);
                parent.save();
                req.flash("success", "Student successfully assigned to parent!");
                res.redirect("/parents/" + req.params.id + "/students");
            }
        }
    });
});

router.delete("/:id/students/:student_id", isAuthorized, function(req,res){
    User.findByIdAndUpdate(req.params.id, {$pull: {students: req.params.student_id}}, function(err, updatedUser){
        if (err){
            req.flash("error", "Error removing student");
            return res.redirect("/parents");
        } 
        req.flash("success", "Successfully removed student!");
        res.redirect("/parents/" + req.params.id + "/students");
    });
});

// ROUTES FOR ADDING AND DELETING EMAIL

router.get("/email-list", isAuthorized, function(req,res){
    Emails.findOne({name: "All"}, function(err, list){
        if (err){
            console.log("There is an error");
        } else {
            res.render("parents/email-list", {emails: list});
        }
    });
});

router.post("/email-list", isAuthorized, function(req,res){
    var email = req.body.email;
    Emails.findOne({name: "All"}, function(err, list){
        if (err){
            console.log("There is an error");
        } else {
            if (list.emails.indexOf(email) > -1) {
                req.flash("error", "Email already exists");
                res.redirect("/parents/email-list");
            } else {
                list.emails.push(email);
                list.save();
                req.flash("success", "Added " + "\'" + email + "\'");
                res.redirect("/parents/email-list");
            }
        }
    });
});

router.delete("/email-list/:email", isAuthorized, function(req, res){
    Emails.findOne({name: "All"}, function(err, list){
        if (err){
            console.log("Error");
        } else {
            list.emails.splice(list.emails.indexOf(req.params.email), 1);
            list.save();
            req.flash("success", "Removed " + "\'" + req.params.email + "\'");
            res.redirect("/parents/email-list");
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