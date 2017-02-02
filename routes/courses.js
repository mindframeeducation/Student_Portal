var express     = require("express"),
    mongoose = require("mongoose"),
    router      = express.Router(),
    Student     = require("../models/student"),
    Course      = require("../models/course");
    
// Route to view all courses
router.get("/courses", function(req,res){
    Course.find({}, function(err, courses){
        if (err){
            console.log("There is an error");
        } else {
            res.render("courses/index", {courses: courses});
        }
    });
    
});
// Route to add a new course to the data base (no units)
router.post("/courses", function(req,res){
    var newCourse = {name: req.body.course_name, units: [], template: true};
    Course.create(newCourse, function(err, course){
        if (err){
            console.log("cannot create course" + err);
        } else {
            console.log("The course is: " + course);
            req.flash("success", "Course created");
            res.redirect("/courses");
        }
    });
});

// Route to update a course (completeness of units)
router.post("/courses/:id", function(req,res){
    console.log(req.body.completed_units);
    var completed_units = req.body.completed_units;
    Course.findById(req.params.id, function(err, course){
        if (err){
            console.log("There is an error" + err);
        } else {
            // Not the most efficient way, but will do for now
            for (var i = 0; i < completed_units.length; i++){
                for (var j = 0; j < course.units.length; j++){
                    if (course.units[j].name === completed_units[i]) {
                        course.units[j].completed = true;
                        course.save();
                        break;
                    }
                }
            }
            // console.log("The course is: " + course);
            req.flash("success", "Updated course");
            res.redirect("back");
        }
    });
});

// Route to add a new unit to a course
router.post("/courses/:id/units", function(req,res){
    Course.findById(req.params.id, function(err, course){
        if (err){
            console.log("There is an error: " + err);
        } else {
            var unit = {name: req.body.unit_name, completed: false};
            course.units.push(unit);
            course.save();
            req.flash("success", "New unit added to : " + course.name);
            res.redirect("/courses");
        }
    });
});

// Route to delete a unit from a course
router.delete("/courses/:id/units/:unit_name", function(req,res){
    console.log("The unit name is: " + req.params.unit_name);
    Course.findById(req.params.id, function(err, course){
        if (err){
            console.log("Cannot find the course in delete route: " + err);
        } else {
            console.log("course found!");
            console.log("The course is: " + course);
            var pos = -1;
            for (var i = 0; i < course.units.length; i++){
                if (course.units[i].name == req.params.unit_name) {
                    pos = i;
                    break;
                }
            }
            if (pos > -1) {
                course.units.splice(pos, 1);
                course.save();
                req.flash("success", "Removed unit");
                res.redirect("/courses");
            } else {
                req.flash("error", "Cannot find the unit");
                res.redirect("/courses");
            }
        }
    });
});

// Route to show the page to assign course to a student
router.get("/courses/assign-course", function(req,res){
    Student.find({}, function(err, students){
        if (err){
            console.log("There is an error: " + err);
        } else {
            Course.find({template: true}, function(err, courses){
                if (err){
                    console.log("Error looking up template for courses" + err);
                } else {
                    res.render("courses/assign-course", {students: students, courses: courses});
                }
            });
        }
    });
});

// Route to assign a course to the student
router.post("/courses/assign-course", function(req,res){
    var student_id  = mongoose.Types.ObjectId(req.body.student_id);
    var course_id   = mongoose.Types.ObjectId(req.body.course_id);
    Student.findById(student_id).populate("courses").exec(function(err, student){
        if (err){
            console.log("Err searching student: " + err);
            req.flash("error", "Error " + err);
            res.redirect("/courses");
        } else {
            Course.findById(course_id, function(err, courseTemplate){
                if (err){
                    console.log("Err searching for course " + err);
                    req.flash("error", "Error " + err);
                    res.redirect("/courses");
                } else {
                    var assign_course = {name: courseTemplate.name, template: false, units: courseTemplate.units};
                    console.log("The assign course is: " + assign_course);
                    console.log("The student is: " + student);
                    var pos = -1;
                    console.log("The student courses are: " + student.courses);
                    for (var i = 0; i < student.courses.length; i++){
                        if (assign_course.name === student.courses[i].name) {
                            pos = i;
                            break;
                        }
                    }
                    console.log("pos is: " + pos);
                    if (pos === -1){ // If a course of the same name already exists
                        Course.create(assign_course, function(err, createdCourse) {
                            if (err){
                                console.log("Err creating course");
                                req.flash("error", "Error " + err);
                                res.redirect("/courses");
                            } else {
                                student.courses.push(createdCourse._id);
                                student.save();
                                req.flash("success", "Course assigned to student");
                                res.redirect("/courses");
                            }
                        });
                    } else {
                        req.flash("error", "Duplicate course assigment!");
                        res.redirect("/courses");
                    }
                }
            });
        }
    });
});


module.exports = router;