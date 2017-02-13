var express = require("express"),
    router = express.Router(),
    Course = require("../models/course"),
    Student = require("../models/student"),
    ClassList = require("../models/classList");
var middlewareObj = require("../middleware");

// ROUTES TO ADD A NEW STUDENT
router.get("/students/new", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    res.render("students/new");
});

router.post("/students", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    var newStudent = {
        "name.first": req.body.first_name,
        "name.last": req.body.last_name,
        entries: [],
        notes: [],
        grade: req.body.grade
    };
    Student.create(newStudent, function(err, student) {
        if (err) {
            console.log("There is an error creating the student: " + err);
            req.flash("error", "Error! Please try again!");
            res.redirect("/students");
        }
        else {
            req.flash("success", "New student created successfully!");
            res.redirect("/students");
        }
    });
});


// SHOW SEARCH PAGE FOR THE STUDENTS
router.get("/students", middlewareObj.isLoggedIn, function(req, res) {
    Student.find({}).populate("entries").exec(function(err, student_list) {
        if (err) {
            console.log("There is an error fetching students from the DB");
        }
        else {
            res.render("students/index", {
                students: student_list
            });
        }
    });
});

// SHOW PAGE FOR A SPECIFIC STUDENT
router.get("/students/:id", middlewareObj.isLoggedIn, function(req, res) {
    // NEED TO HAVE POPULATE(), OR IT WILL ONLY STORES OBJECT IDs 
    // Student.findById(req.params.id).populate("entries notes").exec(function(err, foundStudent){
    Student.findById(req.params.id).populate({
        path: 'entries notes courses',
        options: {
            sort: {
                created: -1
            }
        }
    }).exec(function(err, foundStudent) {
        if (err) {
            console.log("Error: " + err);
        }
        else {
            // console.log("The student is: \n" + foundStudent);
            Student.find({}, function(err, student_list) {
                if (err) {
                    console.log(err);
                }
                else {
                    ClassList.findOne({
                        name: "All"
                    }, function(err, classList) {
                        if (err) {
                            console.log("Err: " + err);
                            res.redirect("back");
                        }
                        else {
                            res.render("students/show", {
                                foundStudent: foundStudent,
                                students: student_list,
                                classList: classList
                            });
                        }
                    });
                }
            });
        }
    });
});

// EDIT PAGE FOR A SPECIFIC STUDENT (POST REQUEST). CURRENTLY BEING WORKED ON
router.put("/students/:id", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findByIdAndUpdate(req.params.id, {
        "name.first": req.body.first_name,
        "name.last": req.body.last_name,
        grade: req.body.grade
    }, function(err, updatedStudent) {
        if (err) {
            console.log("Error updating student");
            res.redirect("back");
        }
        else {
            req.flash("success", "Successfully updated student");
            res.redirect("/students/" + req.params.id);
        }
    });
});

// ROUTE FOR UPDATING STUDENT'S LEARNING GOAL
router.post("/students/:id/learning-goal", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findByIdAndUpdate(req.params.id, {
        learning_goal: req.body.learning_goal
    }, function(err, updatedStudent) {
        if (err) {
            console.log("Error updating learning goal: " + err);
            req.flash("error", "Error updating learning goal");
            res.redirect("back");
        }
        else {
            console.log("The updated student is: " + updatedStudent);
            req.flash("success", "Successfully updated student's learning goal");
            res.redirect("/students/" + req.params.id);
        }
    });
});

// Route to delete a course from a student
router.delete("/students/:id/courses/:course_id", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.findByIdAndUpdate(req.params.id, {
        $pull: {
            courses: req.params.course_id
        }
    }, function(err, student) {
        if (err) {
            req.flash("error", "Err: " + err);
            res.redirect("back");
        }
        else {
            Course.findByIdAndRemove(req.params.course_id, function(err, deletedCourse) {
                if (err) {
                    console.log("err: " + err);
                    req.flash("error", "Err: " + err);
                    res.redirect("back");
                }
                else {
                    // console.log("Delete count is: " + deletedCourse);
                    req.flash("success", "Course deleted!");
                    res.redirect("/students/" + req.params.id);
                }
            });
        }
    });
});

// Extra functions
// function isLoggedIn(req, res, next){
//     if (req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "Please log in first!");
//     res.redirect("/login");
// }

// // Function to check if the user is a staff member
// function isAStaff(req,res,next){
//     if (req.user.hasAccess("user")) {
//         next();
//     } else {
//         req.flash("error", "Permission denied");
//         res.redirect("/students");
//     }
// }

module.exports = router;
