var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
// var emails = require("../emails");
var EmailList = require('../models/emailList');
var Student = require("../models/student");
var mongoose = require("mongoose");
var Entry = require("../models/entry");
var ClassList = require("../models/classList");
var middlewareObj = require("../middleware");

// Display log-in page
router.get("/login", middlewareObj.isLoggedOut, function(req, res) {
    res.render("login");
});

// WORKING VERSION
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password",
}), function(req, res) {
    req.flash("success", "Welcome back, " + req.user.username);
    res.redirect("/blogs");
});

// Routes for creating entry from the nav bar
router.get("/new-entry", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    Student.find({}, function(err, students) {
        if (err) {
            req.flash("error", "Internal error. Please try again");
            res.redirect("/students");
        }
        else {
            ClassList.findOne({}, function(err, classList) {
                if (err) {
                    console.log("Error with class list database");
                }
                else {
                    res.render("entries/new-from-nav", {
                        students: students,
                        classList: classList
                    });
                }
            });
        }
    });
});

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
                    entry.save();
                    foundStudent.entries.push(entry);
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
    res.render("register");
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
            console.log("The return list is: \n" + list);
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

// Register page for staff
router.get("/register/Iyq8UTvzCU/m1ndFrameStaff", middlewareObj.isLoggedOut, function(req, res) {
    res.render("staff_register");
});

// Register page post request for staff
router.post("/register/Iyq8UTvzCU/m1ndFrameStaff", middlewareObj.isLoggedOut, function(req, res) {
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    if (password !== confirm_password) {
        console.log("Passwords do not match!");
        req.flash("error", "Passwords do not match!");
        return res.redirect("/register/Iyq8UTvzCU/m1ndFrameStaff");
    }
    else {
        var newUser = new User({
            username: req.body.username,
            email: req.body.username.toLowerCase(),
            role: 'user'
        });
        User.register(newUser, req.body.password, function(err, user) {
            if (err) {
                console.log("There is an error in registration");
                req.flash("error", err.message);
                return res.redirect("/register/Iyq8UTvzCU/m1ndFrameStaff");
            }
            passport.authenticate("local")(req, res, function() {
                console.log("Staff signed up successfully!");
                req.flash("success", "Welcome to Mindframe Education!");
                res.redirect("/blogs");
            });
        });
    }
});

// CHANGE PASSWORD ROUTES
router.get("/change-password", function(req, res) {
    if (req.user) {
        res.render("change-password");
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
                        res.redirect("/blogs");
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
    res.redirect("/blogs");
});

// FORGET PASSWORD ROUTES ==========
router.get("/forget", function(req, res) {
    res.render("forget");
});

router.post("/forget", function(req, res, next) {
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "mfeducationmail",
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
                    console.log("The user is: " + user);
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 36000000; // Password link will expires in 1 hour
                    user.save();
                    var mailOptions = {
                        from: "Mindframe Education",
                        to: user.email,
                        subject: "Password reset",
                        text: "You are receiving this because you (or someone else) " +
                            "have requested a password reset for the username " + req.body.username +
                            ". Please click on the following link, or paste this into your browser " +
                            "to complete the password reset process: \n" +
                            "https://" + req.headers.host + "/reset/" + token + "\n\n" +
                            "If you did not request this, please ignore this email and your password will " +
                            "remain unchanged." + "\n\n\n" +
                            "Mindframe Dev. team"
                    };

                    transporter.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            return console.log("Error: " + err);
                        }
                        console.log("Success!");
                        req.flash("success", "An email with detailed instructions has been sent to: " + user.email);
                        res.redirect("/blogs");
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
            res.render("reset", {
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
                // them now showing up when showing the database
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
                        res.redirect("/login");
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

// ======================================

// Check if there is a user currently logged in
// function isLoggedOut(req, res, next) {
//     if (req.user) {
//         req.flash("error", "Please log out first");
//         res.redirect("/blogs");
//     }
//     else {
//         next();
//     }
// }

// ==========================================
// Function to check if the user is logged in
// ==========================================
// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     req.flash("error", "You are not logged in!");
//     res.redirect("/login");
// }


// Function to check if the user is a staff member
// function isAStaff(req, res, next) {
//     if (req.isAuthenticated()) { // If the user is logged in
//         if (req.user.hasAccess('user')) { // If the user is a staff member
//             next();
//         }
//         else {
//             req.flash("error", "Permission denied!");
//             res.redirect("/blogs");
//         }
//     }
// }

module.exports = router;

// OLD CODE FOR REFERENCE ======================================================
// router.post('/login', 
//   passport.authenticate('local', { failureRedirect: "/login" }),
//   function(req, res) {
//       req.flash("success", "Welcome back, " + req.user.username);
//       res.redirect("/blogs");
//   });
