var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var User        = require("../models/user");
var nodemailer  = require("nodemailer");
var crypto      = require("crypto");
var emails      = require("../emails");

// Display log-in page
router.get("/login", isLoggedOut, function(req ,res){
   res.render("login");
});

// WORKING VERSION
router.post("/login", passport.authenticate("local", 
    {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password",
    }), function(req, res){
        req.flash("success", "Welcome back, " + req.user.username);
        res.redirect("/blogs");
});


// Display the register page
router.get("/register", isLoggedOut, function(req, res){
    res.render("register");
});

router.post("/register", isLoggedOut, function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    for (var i = 0; i < emails.length; i++){
        if (username.toLowerCase() == emails[i].toLowerCase()){
            if (password != confirm_password){
                req.flash("error", "Passwords do not match!");
                return res.redirect("/register");
            } else {
                // username = username.toLowerCase(); doing this will trigger Unauthorized error. Not sure why yet
                var newUser = new User({username: username, role: "public"});
                User.register(newUser, req.body.password, function(err, user){
                    if (err){
                        console.log("There is an error in registration: " + err);
                        req.flash("error", err.message);
                        return res.redirect("/register");
                    }
                    passport.authenticate("local")(req, res, function(){
                        req.flash("success", "Welcome to Mindframe Education!");
                        return res.redirect("/blogs");
                    });
                });
            }
            return; // Need this, otherwise when the matched email is the second to last, the last one
            // will trigger the else block and will yield an error in the console logs
        }
        else {
            if (i == emails.length - 1){
                console.log("Email is not in system");
                req.flash("error", "Your email is not in our system!");
                res.redirect("/register");
            } 
        }
    }
    
});

// With password confirmation. Working just fine :)
// router.post("/register", isLoggedOut, function(req,res){
//     var password = req.body.password;
//     var confirm_password = req.body.confirm_password;
//     if (password !== confirm_password){
//         req.flash("error", "Passwords do not match!");
//         return res.redirect("/register");
//     } else {
//         var newUser = new User({username: req.body.username, role: "public"});
//         User.register(newUser, req.body.password, function(err, user){
//             if (err){
//                 console.log("There is an error in registration");
//                 req.flash("error", err.message);
//                 return res.redirect("/register");
//             }
//             passport.authenticate("local")(req, res, function(){
//                 req.flash("success", "Welcome to Mindframe Education!");
//                 res.redirect("/blogs");
//             });
//         });
//     }
// });

// Register page for staff
router.get("/register/Iyq8UTvzCU/m1ndFrameStaff", isLoggedOut, function(req,res){
    res.render("staff_register");
});

// Register page post request for staff
router.post("/register/Iyq8UTvzCU/m1ndFrameStaff", isLoggedOut, function(req,res){
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    if (password !== confirm_password){
        console.log("Passwords do not match!");
        req.flash("error", "Passwords do not match!");
        return res.redirect("/register/Iyq8UTvzCU/m1ndFrameStaff");
    } else {
        var newUser = new User({username: req.body.username, role: 'user'});
        User.register(newUser, req.body.password, function(err, user){
            if (err){
                console.log("There is an error in registration");
                req.flash("error", err.message);
                return res.redirect("/register/Iyq8UTvzCU/m1ndFrameStaff");
            }
            passport.authenticate("local")(req, res, function(){
                console.log("Staff signed up successfully!");
                req.flash("success", "Welcome to Mindframe Education!");
                res.redirect("/blogs");
            });
        });
    }
});

// CHANGE PASSWORD ROUTES
router.get("/change-password", function(req, res){
    if (req.user){
        res.render("change-password");
    } else {
        req.flash("error", "Please log in first!");
        res.redirect("/login");
    }
})

router.post("/change-password", function(req,res){
    User.findByUsername(req.user.username, function(err, foundUser){
        if (err){
            console.log(err);
            req.flash("error", "No such username found!");
            res.redirect("/change-password");
        } else {
            if (req.body.password === req.body.confirm_password){
                foundUser.setPassword(req.body.password, function(err){
                    if (err){
                        console.log("There is an error updating password");
                        req.flash("error", "There is an error. Please try again");
                        res.redirect("/blogs");
                    } else {
                        foundUser.save();
                        req.flash("success", "Password changed successfully!");
                        res.redirect("/blogs");
                    }
                })
            } else {
                req.flash("error", "Passwords do not match!");
                res.redirect("back");
            }
        }
    });
});

// Handle logic for logging out
router.get("/logout", isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect("/blogs");
});

// FORGET PASSWORD ROUTES ==========
router.get("/forget", function(req,res){
    res.render("forget");
});

router.post("/forget", function(req,res,next){
    var transporter = nodemailer.createTransport({
        service: "Gmail", 
        auth: {
            user: "mfeducationmail",
            pass: "mindframeAdm1n"
        }
    })
    // Create a random to token for password reset
    crypto.randomBytes(20, function(err, buff){
        if (err){
            console.log(err);
        } else {
            var token = buff.toString("hex");
            User.findByUsername(req.body.username, function(err, user){
                if (err){
                    console.log("Username not found");
                    res.redirect("/forget");
                } else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 36000000; // Password link will expires in 1 hour
                    user.save();
                    var mailOptions = {
                        from: "Mindframe Education",
                        to: req.body.username,
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
                    
                    transporter.sendMail(mailOptions, function(err, info){
                        if (err){
                            return console.log("Error: " + err);
                        }
                        console.log("Success!");
                        req.flash("success", "An email with detailed instructions has been sent to: " + req.body.email);
                        res.redirect("/blogs");
                    });
                }
            })
        }
    });
    
});
// =================================

// PASSWORD RESET ROUTE =================
router.get("/reset/:token", function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if (!user){ // If no such user exists
            console.log(err);
            req.flash("error", "The reset password link is invalid or has expired");
            res.redirect("/blogs");
        } else {
            res.render("reset", {token: req.params.token});
        }
    });
});

router.post("/reset/:token", function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if (err){
            console.log("There is an error: " + err);
            req.flash("error", "The reset password link is invalid or has expired");
            res.redirect("/blogs");
        } else {
            if (req.body.password === req.body.confirm_password){
                // Nullify the reset password fields. Making them undefined will have
                // them now showing up when showing the database
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.setPassword(req.body.password, function(err){
                    if (err){
                        console.log("Error: " + err);
                        res.redirect("/blogs");
                    } else {
                        user.save();
                        req.flash("Password reset successfully! Please login with your new password!");
                        res.redirect("/login");
                    }
                })
            } else {
                req.flash("Password do not match! Please try again!");
                res.redirect("back");
            }
        }
    })
})

// ======================================

// Check if there is a user currently logged in
function isLoggedOut(req,res,next){
    if (req.user){
        req.flash("error", "Please log out first");
        res.redirect("/blogs");
    } else {
        next();
    }
}

// ==========================================
// Function to check if the user is logged in
// ==========================================
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You are not logged in!");
    res.redirect("/login");
}

module.exports = router;

// OLD CODE FOR REFERENCE ======================================================
// Handle the logic for registering
// Original and working route!
// router.post("/register", function(req,res){
//     var newUser = new User({username: req.body.username, role: "user"});
//     User.register(newUser, req.body.password, function(err, user){
//         if (err){
//             console.log("The error is " + err);
//             req.flash("error", err.message);
//             return res.redirect("/register");
//         }
//         passport.authenticate("local")(req, res, function(){
//             console.log("The user signed up successfully!");
//             req.flash("success", "Welcome to Mindframe Education!");
//             res.redirect("/blogs");
//         });
//     });
// });

// OLD (still working !!!)
// router.post('/login', 
//   passport.authenticate('local', { failureRedirect: "/login" }),
//   function(req, res) {
//       req.flash("success", "Welcome back, " + req.user.username);
//       res.redirect("/blogs");
//   });
  


// router.post('/login', passport.authenticate('local'), function(req, res) {
//     res.redirect('/');
//     console.log(req.user);
//     console.log("The requested username is " + req.user.username);
//     console.log("The reqeusted password is " + req.user.password);
// });