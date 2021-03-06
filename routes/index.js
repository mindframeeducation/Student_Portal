var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var EmailList = require('../models/emailList');
var Student = require("../models/student");
var mongoose = require("mongoose");
var Entry = require("../models/entry");
var ClassList = require("../models/classList");
var Course = require("../models/course");
var middlewareObj = require("../middleware");
var SparkPost = require('sparkpost');
var client = new SparkPost('2afe8ebd209e291dd49293dd6d6bf68759bff883');

// Display log-in page
router.get("/login/:option", middlewareObj.isLoggedOut, function(req, res) {
    res.render("users/login", {
        option: req.params.option
    });
});

// Log-in post request. Now take into accout if the login is a normal one (returning user)
// or a "first-time" one (new user being invite to the system)
router.post("/login/:option", passport.authenticate("local", {
    failureRedirect: "/login/:option",
    failureFlash: "Invalid username or password",
}), function(req, res) {
    if (req.params.option === "normal" || req.params.option === ":option") {
        req.flash("success", "Welcome back, " + req.user.username);
        res.redirect("/students");
    }
    else {
        req.flash("success", "Welcome! Please change your password now!");
        res.redirect("/change-password");
    }
});

// Routes for creating entry from the nav bar
router.get("/new-entry", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.find({}, function(err, students) {
        if (err) {
            req.flash("error", "Internal error. Please try again");
            res.redirect("/students");
        }
        else {
            Course.find({}, function(err, courses) {
                if (err) {
                    console.log("Error with class list database");
                }
                else {
                    res.render("entries/new-from-nav", {
                        students: students,
                        courses: courses
                    });
                }
            });
        }
    });
});

// POST request to create a new entry
router.post("/new-entry", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    // console.log("Class name: " + req.body.entry.class);
    if (!req.body.student_id) {
        req.flash("error", "Please select a student");
        return res.redirect("back");
    }
    if (!req.body.entry.class_name) {
        req.flash("error", "Please select a class");
        return res.redirect("back");
    }
    if (!req.body.entry.summary) {
        req.flash("error", "Please fill in the summary");
        return res.redirect("back");
    }
    var student_id = mongoose.Types.ObjectId(req.body.student_id);
    Student.findById(student_id, function(err, foundStudent) {
        if (err) {
            req.flash("error", "There is an error: " + err);
            res.redirect("/students");
        }
        else {
            Entry.create(req.body.entry, function(err, entry) {
                if (err) {
                    req.flash("error", "Error creating entry: " + err);
                    res.redirect("/students");
                }
                else {
                    entry.author.id = req.user.id;
                    entry.author.username = req.user.username;
                    entry.created = Date.now();
                    entry.save();
                    foundStudent.entries.push(entry);
                    // foundStudent.latest_entry_date = entry.created;
                    foundStudent.save();
                    req.flash("success", "Entry successfully created");
                    res.redirect("/students/" + foundStudent._id);
                }
            });
        }
    });
});

// Display the register page
router.get("/register", middlewareObj.isLoggedOut, function(req, res) {
    res.render("users/register");
});

router.post("/register", middlewareObj.isLoggedOut, function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    // .find() returns an array (even when there is only 1 object in the database) .findOne() return 1 object
    EmailList.findOne({
        name: "All"
    }, function(err, list) {
        if (err) {
            console.log("There is an error with email database");
            req.flash("error", "Internal error. Please contact admin");
            res.redirect("back");
        }
        else {
            if (list.emails.indexOf(username) > -1) {
                if (password !== confirm_password) {
                    req.flash("error", "Passwords do not match!");
                    return res.redirect("/register");
                }
                else {
                    var newUser = new User({
                        username: username,
                        email: username.toLowerCase(),
                        students: [],
                        role: "public"
                    });
                    User.register(newUser, req.body.password, function(err, user) {
                        if (err) {
                            console.log("There is an error in registration: " + err);
                            req.flash("error", err.message);
                            return res.redirect("/register");
                        }
                        else {
                            passport.authenticate("local")(req, res, function() {
                                req.flash("success", "Welcome to Mindframe Education!");
                                return res.redirect("/blogs");
                            });
                        }
                    });
                }
            }
            else {
                req.flash("error", "Email is not in our system!");
                res.redirect("/register");
            }
        }
    });
});

// Send invitation to parent
router.post("/parent_register", function(req, res) {
    var students = req.body.students;
    crypto.randomBytes(5, function(err, buff) {
        if (err) {
            console.log("err");
            req.flash("error", "Error generating byte");
            return res.redirect("back");
        }
        var newUser = new User({
            username: req.body.username,
            email: req.body.username.toLowerCase(),
            role: "public"
        });
        User.register(newUser, buff.toString("hex"), function(err, user) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            }
            else {
                // Assign the students to this parent
                // var students = req.body.students;
                if (typeof students === 'string') {
                    user.students.push(mongoose.Types.ObjectId(students));
                }
                else if (typeof students === 'object') {
                    students.forEach(function(student_id) {
                        user.students.push(mongoose.Types.ObjectId(student_id));
                    });
                }
                user.save();
                client.transmissions.send({
                    options: {
                        sandbox: false
                    },
                    content: {
                        from: 'no-reply@mindframeeducation.com',
                        subject: 'STEM Academy Portal Invitation',
                        text: "Hi,\n\n" +
                            "You are invited to join the Mindframe STEM Academy Portal. In this " +
                            "Portal, you can view your child's goals and progress in their STEM classes.\n\n" +
                            "To access the portal, please use the link and the temporary password below to log in to your account:\n\n" +
                            "https://" + req.headers.host + "/login/first_time" + "\n\n" +
                            "Username: " + user.email + "\n" +
                            "Password: " + buff.toString("hex") + "\n\n" +
                            "After logging in, you can change your password.\n\n\n" +
                            "Let us know if you have any questions or need assistance with accessing the portal.\n\n" +
                            "Thanks,\n\n" + "Mindframe Team",
                    },
                    recipients: [{
                        address: user.email
                    }]
                }).then(data => {
                    req.flash("success", "Invitation sent!");
                    res.redirect("back");
                }).catch(err => {
                    req.flash("error", "Error sending invitation: " + err.message);
                    res.redirect("back");
                });
            } // else block
        });
    });
});

// Send invitation to user
router.post("/staff_register", function(req, res) {
    crypto.randomBytes(10, function(err, buff) {
        if (err) {
            console.log("err");
            req.flash("error", "Error generating byte");
            return res.redirect("back");
        }
        else {
            // var password = buff.toString("hex");
            // console.log("The password is: " + password);
            var newUser = new User({
                username: req.body.username,
                email: req.body.username.toLowerCase(),
                role: "user"
            });
            User.register(newUser, buff.toString("hex"), function(err, user) {
                if (err) {
                    console.log("err");
                    req.flash("error", "This user is already in the database!");
                    res.redirect("back");
                }
                else {
                    client.transmissions.send({
                        options: {
                            sandbox: false
                        },
                        content: {
                            from: "no-reply@mindframeeducation.com",
                            subject: "STEM Academy Portal Invitation",
                            text: "Hi,\n\n" +
                                "You are invited to join the Mindframe Student's Portal\n\n" +
                                "To access the portal, please use the link and the temporary password below to log in to your account:\n\n" +
                                "https://" + req.headers.host + "/login/first_time" + "\n\n" +
                                "Username: " + user.email + "\n" +
                                "Password: " + buff.toString("hex") + "\n\n" +
                                "After logging in, you can change your password.\n\n\n" +
                                "Thanks,\n\n" + "Mindframe Team",
                        },
                        recipients: [{
                            address: user.email
                        }]
                    }).then(data => {
                        req.flash("success", "Invitation sent!");
                        res.redirect("back");
                    }).catch(err => {
                        req.flash("error", "Error sending invitation: " + err.message);
                        res.redirect("back");
                    });
                }
            });
        }
    });
});

// CHANGE PASSWORD ROUTES
router.get("/change-password", function(req, res) {
    if (req.user) {
        res.render("users/change-password");
    }
    else {
        req.flash("error", "Please log in first!");
        res.redirect("/login");
    }
});

router.post("/change-password", function(req, res) {
    User.findByUsername(req.user.username, function(err, foundUser) {
        if (err) {
            console.log(err);
            req.flash("error", "No such username found!");
            res.redirect("/change-password");
        }
        else {
            if (req.body.password === req.body.confirm_password) {
                foundUser.setPassword(req.body.password, function(err) {
                    if (err) {
                        console.log("There is an error updating password");
                        req.flash("error", "There is an error. Please try again");
                        res.redirect("/blogs");
                    }
                    else {
                        foundUser.save();
                        req.flash("success", "Password changed successfully!");
                        res.redirect("/students");
                    }
                });
            }
            else {
                req.flash("error", "Passwords do not match!");
                res.redirect("back");
            }
        }
    });
});

// Handle logic for logging out
router.get("/logout", middlewareObj.isLoggedIn, function(req, res) {
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect("/login/normal");
});

// FORGET PASSWORD ROUTES ==========
router.get("/forget", function(req, res) {
    res.render("users/forget");
});

router.post("/forget", function(req, res, next) {
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "mindframe.dev.team",
            pass: "mindframeAdm1n"
        }
    });
    // Create a random to token for password reset
    crypto.randomBytes(20, function(err, buff) {
        if (err) {
            console.log(err);
        }
        else {
            var token = buff.toString("hex");
            User.findOne({
                email: req.body.username.toLowerCase()
            }, function(err, user) {
                if (!user) {
                    console.log(err); // To prevent the warning
                    req.flash("error", "Username or email not found");
                    res.redirect("/forget");
                }
                else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 36000000; // Password link will expires in 1 hour
                    user.save();

                    client.transmissions.send({
                        options: {
                            sandbox: false
                        },
                        content: {
                            from: "no-reply@mindframeeducation.com",
                            subject: "STEM Academy Portal Password Reset",
                            text: "Hi,\n\n" +
                                "You are receiving this email because you (or someone else) " +
                                "have requested a password reset for the username " + req.body.username + ". " +
                                "To complete the password reset process, please click on the following link, " +
                                "or copy and paste it into your browser's address bar: \n\n" +
                                "https://" + req.headers.host + "/reset/" + token + "\n\n" +
                                "If you did not request a password reset, please ignore this email and your password " +
                                "will remain unchanged.\n\n\n" + "Thanks,\n\n" + "Mindframe Team"
                        },
                        recipients: [{
                            address: user.email
                        }]
                    }).then(data => {
                        req.flash("success", "Instruction on how to reset your password has been sent to: " + user.email);
                        res.redirect("/blogs");
                    }).catch(err => {
                        req.flash("error", "Error sending invitation: " + err.message);
                        res.redirect("back");
                    });
                }
            });
        }
    });
});
// =================================

// PASSWORD RESET ROUTE =================
router.get("/reset/:token", function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (!user) { // If no such user exists
            console.log(err);
            req.flash("error", "The reset password link is invalid or has expired");
            res.redirect("/blogs");
        }
        else {
            res.render("users/reset", {
                token: req.params.token
            });
        }
    });
});

router.post("/reset/:token", function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (err) {
            console.log("There is an error: " + err);
            req.flash("error", "The reset password link is invalid or has expired");
            res.redirect("/blogs");
        }
        else {
            if (req.body.password === req.body.confirm_password) {
                // Nullify the reset password fields. Making them undefined will have
                // them not showing up when showing the database
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.setPassword(req.body.password, function(err) {
                    if (err) {
                        console.log("Error: " + err);
                        res.redirect("/blogs");
                    }
                    else {
                        user.save();
                        req.flash("success", "Password reset successfully! Please login with your new password!");
                        res.redirect("/login/normal");
                    }
                });
            }
            else {
                req.flash("error", "Password do not match! Please try again!");
                res.redirect("/login");
            }
        }
    });
});

module.exports = router;
