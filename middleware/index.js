var Blog = require("../models/blog");
var Note = require("../models/note");
var Entry = require("../models/entry");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect("/login");
};

middlewareObj.isLoggedOut = function(req, res, next) {
    if (req.user) {
        req.flash("error", "Please log out first");
        res.redirect("/blogs");
    }
    else {
        next();
    }
};

middlewareObj.isAdmin = function(req, res, next) {
    if (req.user.hasAccess('admin')) {
        return next();
    }
    req.flash("error", "You do not have permission!");
    res.redirect("back");
};

middlewareObj.isAStaff = function(req, res, next) {
    if (req.user.hasAccess('user')) {
        return next();
    }
    req.flash("error", "You do not have permission");
    res.redirect("back");
};

middlewareObj.checkBlogOwnership = function(req, res, next) {
    Blog.findById((req.params.id), function(err, foundBlog) {
        if (err) {
            console.log("There is an error looking for the specific blog");
        }
        else {
            // If user IDs matches, or if the user is admin
            if (foundBlog.author.id.equals(req.user._id) || req.user.hasAccess("admin")) {
                next(); // continue
            }
            else {
                req.flash("error", "Permission denied");
                res.redirect("/blogs");
            }
        }
    });
};

middlewareObj.checkNoteOwnership = function(req, res, next) {
    Note.findById(req.params.note_id, function(err, foundNote) {
        if (err) {
            console.log(err);
            req.flash("error", "Error looking up a note");
            res.redirect("back");
        }
        else {
            console.log("The found note is: " + foundNote);
            if (foundNote.author.id.equals(req.user._id) || req.user.hasAccess("admin")) {
                next();
            }
            else {
                req.flash("error", "You do not have permission to do that!");
                res.redirect("/blogs");
            }
        }
    });
};

middlewareObj.checkEntryOwnership = function(req, res, next) {
    Entry.findById(req.params.entry_id, function(err, foundEntry) {
        if (err) {
            req.flash("error", "Error looking up an entry");
            res.redirect("back");
        }
        else {
            if (foundEntry.author.id.equals(req.user._id) || req.user.hasAccess("admin")) {
                next();
            }
            else {
                req.flash("error", "You do not have permission to do that!");
                res.redirect("/blogs");
            }
        }
    });
};
module.exports = middlewareObj;
