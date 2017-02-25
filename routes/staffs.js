var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    middlewareObj = require("../middleware");

// Route to display the index page for staff management
router.get("/staff", middlewareObj.isLoggedIn, middlewareObj.isAdmin, function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            console.log("Error" + err);
            req.flash("error", "Error! Try again");
            res.redirect("back");
        }
        else {
            res.render("staffs/index", {
                users: users
            });
        }
    });

});

// Route to update a staff member
router.put("/staff/:id", middlewareObj.isLoggedIn, middlewareObj.isAdmin, function(req, res) {
    if (req.body.user.role === "admin") {
        req.flash("error", "You cannot assign admin role!");
        return res.redirect("back");
    }
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, user) {
        if (err) {
            req.flash("error", "Try again!");
            res.redirect("back");
        }
        else {
            req.flash("success", "Role updated!");
            res.redirect("back");
        }
    });
});

router.delete("/staff/:id", middlewareObj.isLoggedIn, middlewareObj.isAdmin, function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            req.flash("error", "Error");
            res.redirect("back");
        }
        else {
            req.flash("success", "User removed!");
            res.redirect("back");
        }
    });
});

module.exports = router;
