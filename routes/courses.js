var express     = require("express"),
    mongoose = require("mongoose"),
    router      = express.Router(),
    Student     = require("../models/student"),
    Course      = require("../models/course");
/*
    Routes:
    get("/courses")                         : view all courses
    post("/courses")                        : add a new course to the database (course will have 0 units)
    post("/courses/                         :id/update-course-name/:old_name"): update a course's name
    post("/courses/:id/update-units")       : change a course's units completenesses
    post("/courses/:id/units")              : add a new unit to the course
    delete("/courses/:id/units/:unit_name") : delete a unit from a course, and update courses generated from this template
    post("/courses/:id/units/:unit_index")   : update a course's unit's name
    get("/courses/assign-course")           : show page for assigning course to a student
    post("/courses/assign-course")          : assign a course to a student
    
*/
    
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
            // console.log("The course is: " + course);
            req.flash("success", "Course created");
            res.redirect("/courses");
        }
    });
});

// Route to edit course name
router.post("/courses/:id/update-course-name/:old_name", function(req,res){
    console.log("The old name is " + req.params.old_name);
    Course.findByIdAndUpdate(req.params.id, {name: req.body.course_name.trim()}, {new: true}, function(err, course){
        if (err){
            console.log("There is an error: " + err);
        } else {
            console.log("Updated course is " + course);
            Course.find({name: req.params.old_name}, function(err, courses){
                if (err){
                    console.log("Error updating all other courses");
                    req.flash("error", "There is an error");
                    res.redirect("back");
                } else {
                    courses.forEach(function(course){
                        course.name = req.body.course_name.trim();
                        course.save();
                    });
                    req.flash("success", "Course name updated");
                    res.redirect("/courses");
                }
            });
        }
    });
});

// Route to update a course (completeness of units)
router.post("/courses/:id/update-units", function(req,res){
    var completed_units = req.body.completed_units;
    Course.findById(req.params.id, function(err, course){
        if (err){
            console.log("There is an error HERE: " + err);
        } else {
            // Need to reset all units first since user might uncheck unit
            // Very inefficient. Will need to come up with a better solution
            if (completed_units) {
                course.units.forEach(function(unit){
                    if (unit.completed){
                        unit.completed = false;
                        // console.log("Unit modified was: " + unit.name);
                    }
                });
            } else {
                course.units.forEach(function(unit){
                    unit.completed = false;
                });
                course.save();
                req.flash("success", "Course's units updated");
                return res.redirect("back");
            }
            // When there is only 1 unit checked, the return value is a string
            // So we need to do it this way
            if (typeof(completed_units) === "string") {
                for (var i = 0; i < course.units.length; i++){
                    if (completed_units === course.units[i].name) {
                        course.units[i].completed = true;
                        course.save();
                    }
                }
            }
            else {
                // Not the most efficient way, but will do for now
                for (var i = 0; i < completed_units.length; i++){
                    for (var j = 0; j < course.units.length; j++){
                        // course.units[j].completed = false;
                        if (course.units[j].name === completed_units[i]) {
                            course.units[j].completed = true;
                            course.save();
                            break;
                        }
                    }
                }
            }
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
            var unit = {name: req.body.unit_name.trim(), completed: false};
            course.units.push(unit);
            course.save();
            // Adding this new unit to courses generated from this template
            Course.find({name: course.name}, function(err, generated_courses){
                if (err){
                    console.log("error: " + err);
                } else {
                    generated_courses.forEach(function(course){
                        if (course.id !== req.params.id){
                            course.units.push(unit);
                            course.save();
                        }
                    });
                    req.flash("success", "New unit added to : " + course.name);
                    res.redirect("/courses");
                }
            });
        }
    });
});

// Routes to edit a unit from a course, and update courses generated
// from this template
// GET request
router.get("/courses/:id/units/:unit_index", function(req,res){
    Course.findById(req.params.id, function(err,course){
        if (err){
            console.log("there is an error");
            res.redirect("back");
        } else {
            res.render("courses/edit-unit", {course: course, unit_index: req.params.unit_index});
        }
    });
});

// PUT request
router.put("/courses/:id/units/:unit_index", function(req,res){
    Course.findById(req.params.id, function(err, template){
        if (err){
            console.log("Err: " + err);
            res.redirect("back");
        } else {
            // Update course template
            template.units[req.params.unit_index].name = req.body.unit_name.trim();
            template.save();
            // Update courses generated from the template
            Course.find({name: template.name}, function(err, courses){
                if (err){
                    console.log("Err: " + err);
                    res.redirect("back");
                } else {
                    courses.forEach(function(course){
                        course.units[req.params.unit_index].name = req.body.unit_name.trim();
                        course.save();
                    });
                    req.flash("success", "Unit updated!");
                    res.redirect("/courses");
                }
            });
        }
    });
});

// Route to delete a unit from a course, and update courses 
// generated from this template 
router.delete("/courses/:id/units/:unit_name", function(req,res){
    console.log("The unit name is: " + req.params.unit_name);
    Course.findById(req.params.id, function(err, course){
        if (err){
            console.log("Cannot find the course in delete route: " + err);
            req.flash("error", "Error finding course: " + err);
            res.redirect("back");
        } else {
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
                // Also delete the units from courses generated from this template
                Course.find({name: course.name}, function(err, generated_courses){
                    if (err){
                        console.log("err " + err);
                        req.flash("error", "Error");
                        res.redirect("back");
                    } else {
                        generated_courses.forEach(function(course){
                            if (course.id !== req.params.id){
                                course.units.splice(pos,1);
                                course.save();  
                            }
                        });
                        req.flash("success", "Removed unit");
                        res.redirect("/courses");
                    }
                });
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
                    var pos = -1;
                    console.log("The student courses are: " + student.courses);
                    for (var i = 0; i < student.courses.length; i++){
                        if (assign_course.name === student.courses[i].name) {
                            pos = i;
                            break;
                        }
                    }
                    // console.log("pos is: " + pos);
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