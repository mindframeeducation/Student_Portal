var express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    middlewareObj = require("../middleware");
    
router.get("/staff", function(req,res){
    User.find({}, function(err, users){
        if (err){
            console.log("Error" + err);
            req.flash("error", "Error! Try again");
            res.redirect("back");
        } else {
            res.render("staffs/index", {users: users});
        }
    });
    
});

module.exports = router;