var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middlewareObj = require("../middleware");

// =================
// BLOG ROUTES
// =================
router.get("/", function(req, res) {
    Blog.find({}, function(err, blogsFromApp) {
        if (err) {
            console.log("Error rendering!");
        }
        else {
            res.render("blogs/index", {
                blogs: blogsFromApp
            });
        }
    });
});

// New route
router.get("/new", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    res.render("blogs/new");
});

// Create route
router.post("/", middlewareObj.isLoggedIn, middlewareObj.isAStaff, function(req, res) {
    console.log(req.body); // Before Sanitize
    //req.body.blog.body = req.sanitize(req.body.blog.body); // sanitize the blog's body
    console.log("After sanitization");
    console.log(req.body); // After sanitize
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var blogTitle = req.body.title;
    var blogImage = req.body.image;
    var blogBody = req.sanitize(req.body.body);
    var newBlog = {
        title: blogTitle,
        image: blogImage,
        body: blogBody,
        author: author
    };
    Blog.create(newBlog, function(err, newBlog) {
        if (err) {
            res.render("new");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

// Show route
router.get("/:id", middlewareObj.isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            res.render("blogs/show", {
                blog: foundBlog
            });
        }
    });
});

// EDIT ROUTE. DISABLED SINCE THIS IS NO LONGER NEEDED
// router.get("/:id/edit", isAuthorized, function(req,res){
//     Blog.findById(req.params.id, function(err, foundBlog){
//       if (err){
//           res.redirect("/blogs");
//       } else {
//           res.render("blogs/edit", {blog: foundBlog});
//       }
//   }); 
// });

// UPDATE ROUTE
router.put("/:id", middlewareObj.checkBlogOwnership, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body); // Sanitize!
    //id, newData, callBackFunction
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            req.flash("success", "Blog successfully updated!");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// Delete route
router.delete("/:id", middlewareObj.checkBlogOwnership, function(req, res) {
    // Destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/blogs");
        }
        else {
            req.flash("success", "Blog successfully deleted!");
            res.redirect("/blogs");
        }
    });
});

module.exports = router;
