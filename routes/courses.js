var express     = require("express"),
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



module.exports = router;