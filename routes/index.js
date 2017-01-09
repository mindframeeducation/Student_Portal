var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var User        = require("../models/user");
var nodemailer  = require("nodemailer");
var crypto      = require("crypto");
var Async       = require("async");

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

// With password confirmation. Working just fine :)
router.post("/register", isLoggedOut, function(req,res){
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    if (password !== confirm_password){
        req.flash("error", "Passwords do not match!");
        return res.redirect("/register");
    } else {
        var newUser = new User({username: req.body.username, role: "public"});
        User.register(newUser, req.body.password, function(err, user){
            if (err){
                console.log("There is an error in registration");
                req.flash("error", err.message);
                return res.redirect("/register");
            }
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to Mindframe Education!");
                res.redirect("/blogs");
            });
        });
    }
});

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

// Change password routes
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
    })
})

// Handle logic for logging out
router.get("/logout", isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "You have successfully logged out!");
    res.redirect("/blogs");
});

// FORGET PASSWORD ROUTES ==========
router.get("/forget", function(req,res){
    console.log("The user is: " + req.user);
    res.render("forget");
});

router.post("/forget", function(req,res,next){
    Async.waterfall([
        function(done){
            crypto.randomBytes(20,function(err,buf){
                if (err){
                    console.log(err);
                    return res.redirect("/blogs");
                } else {
                    var token = buf.toString("hex");
                }
            });
        },
        
        function(token, done){
            User.findByUsername(req.body.username, function(err, foundUser){
                if (err){
                    console.log("Error! Cannot find the user: " + err);
                } else {
                    // Generate the token for the user that request password reset
                    foundUser.resetPasswordToken = token;
                    foundUser.resetPasswordExpires = Date.now() + 3600000; // This password token is valid for 1 hour
                    
                    // Save that info to the user's database
                    foundUser.save(function(err){
                        done(err, token, foundUser);
                    });
                }
            });
        },
        
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: "Gmail",
                auth: {
                    user: "mfeducationmail@gmail.com",
                    pass: "mindframeAdm1n"
                }
            });
            
            var mailOptions = {
                to: req.body.email,
                from: "passwordreset@demo.com",
                subject: "Password reset",
                text: "Please click on this link: " + 'http://' + req.headers.host + '/reset/' + token
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash("success", "An email has been sent to " + req.body.email + " with further instructions");
                done(err, "done");
            });
        }
    ], function(err){
        if (err){
            return next(err);
        }
        
    })
})
// =================================

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