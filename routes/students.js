var express     = require("express"),
    router      = express.Router(),
    Student     = require("../models/student");
    
// ROUTES TO ADD A NEW STUDENT
router.get("/students/new", isLoggedIn, isAStaff, function(req,res){
    res.render("students/new");
});

router.post("/students", isLoggedIn, isAStaff, function(req,res){
    var newStudent = {"name.first" : req.body.first_name, "name.last": req.body.last_name, entries: [], notes: [],  grade: req.body.grade};
    Student.create(newStudent, function(err, student){
        if (err){
            console.log("There is an error creating the student: " + err);
            req.flash("error", "Error! Please try again!");
            res.redirect("/students");
        } else {
            req.flash("success", "New student created successfully!");
            res.redirect("/students");
        }
    })
});
    

// SHOW SEARCH PAGE FOR THE STUDENTS
router.get("/students", isLoggedIn, function(req, res){
    Student.find({}).populate("entries").exec(function(err, student_list){
        if (err){
            console.log("There is an error fetching students from the DB");
        } else {
            res.render("students/index", {students: student_list});
        }
    });
});

// SHOW PAGE FOR A SPECIFIC STUDENT
router.get("/students/:id", isLoggedIn, function(req,res){
    // NEED TO HAVE POPULATE(), OR IT WILL ONLY STORES OBJECT IDs 
    Student.findById(req.params.id).populate("entries").exec(function(err, foundStudent){
        if (err){
            console.log("Error: " + err);
        } else {
            Student.find({}, function(err,student_list){
                if (err){
                    console.log(err);
                } else {
                    res.render("students/show", {foundStudent: foundStudent, students: student_list});
                }
            });
        }
    });
});

// EDIT PAGE FOR A SPECIFIC STUDENT (GET REQUEST). TAKING OUT SINCE WE ARE USING MODAL
// router.get("/students/:id/edit", isLoggedIn, isAStaff, function(req,res){
//     Student.findById(req.params.id, function(err,foundStudent){
//         if (err){
//             console.log("Student cannot be found! " + err);
//         } else {
//             res.render("students/edit", {foundStudent: foundStudent});
//         }
//     });
// });

// EDIT PAGE FOR A SPECIFIC STUDENT (POST REQUEST). CURRENTLY BEING WORKED ON
router.put("/students/:id", isLoggedIn, isAStaff, function(req,res){
    Student.findByIdAndUpdate(req.params.id, {"name.first": req.body.first_name, "name.last": req.body.last_name, grade: req.body.grade}, function(err,updatedStudent){
        if (err){
            console.log("Error updating student");
            res.redirect("back");
        } else {
            req.flash("success", "Successfully updated student");
            res.redirect("/students/" + req.params.id);
        }
    });
});

// Extra functions
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect("/login");
}

// Function to check if the user is a staff member
function isAStaff(req,res,next){
    if (req.user.hasAccess("user")) {
        next();
    } else {
        req.flash("error", "Permission denied");
        res.redirect("/students");
    }
}

module.exports = router;