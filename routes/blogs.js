var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");

// =================
// BLOG ROUTES
// =================
router.get("/", function(req, res){
    Blog.find({}, function(err,blogsFromApp){
        if (err){
            console.log("Error rendering!");
        } else {
            res.render("blogs/index", {blogs: blogsFromApp});
        }
    });
});

// New route
router.get("/new", isLoggedIn, isAStaff, function(req,res){
    res.render("blogs/new");
});

// Create route
router.post("/", isLoggedIn, isAStaff, function(req, res){
    // Create a blog
    // run a re-direct (redirect to index.ejs)
    console.log(req.body); // Before Sanitize
    //req.body.blog.body = req.sanitize(req.body.blog.body); // sanitize the blog's body
    console.log("After sanitization"); 
    console.log(req.body);// After sanitize
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var blogTitle = req.body.title;
    var blogImage = req.body.image;
    var blogBody = req.sanitize(req.body.body);
    var newBlog = {title: blogTitle, image: blogImage, body: blogBody, author: author};
    Blog.create(newBlog,function(err,newBlog){
       if (err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

// Show route
router.get("/:id", isLoggedIn, function(req,res){
   Blog.findById(req.params.id, function(err, foundBlog){
       if (err){
           res.redirect("/blogs");
       } else {
           res.render("blogs/show", {blog: foundBlog});
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
router.put("/:id", isAuthorized, function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body); // Sanitize!
                                                        //id, newData, callBackFunction
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            req.flash("success", "Blog successfully updated!");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// Delete route
router.delete("/:id", isAuthorized, function(req,res){
    // Destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/blogs");
        } else {
            req.flash("success", "Blog successfully deleted!");
            res.redirect("/blogs");
        }
    });
});

// ==========================================
// Function to check if the user is logged in
// ==========================================
function isLoggedIn(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect("/login");
}

// ======================================================================
// Function to check if the user is authorized to edit or delete the blog
// ======================================================================
function isAuthorized(req, res, next){
    if (req.isAuthenticated()){ // If the user is logged in
        Blog.findById((req.params.id), function(err, foundBlog){
            if (err){
                console.log("There is an error looking for the specific blog");
            } else {
                // If user IDs matches, or if the user is admin
                if (foundBlog.author.id.equals(req.user._id) || req.user.hasAccess("admin")){ 
                    next(); // continue
                } else {
                    req.flash("error", "Permission denied");
                    res.redirect("/blogs");
                }
            }
        });
    }
}

// Function to check if the user is a staff member
function isAStaff(req,res,next){
    if(req.isAuthenticated()){ // If the user is logged in
        if (req.user.hasAccess('user')){ // If the user is a staff member
            next();
        } else {
            req.flash("error", "Permission denied!");
            res.redirect("/blogs");
        }
    }
}

module.exports = router;