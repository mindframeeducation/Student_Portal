var express         = require("express"),
    router          = express.Router({mergeParams: true}),
    middlewareObj   = require("../middleware"),
    Entry           = require("../models/entry"),
    Comment         = require("../models/comment"); 

router.post("/", function(req,res){
    Entry.findById(req.params.id, function(err, foundEntry){
        if (err){
            req.flash("error", "Cannot find entry");
            res.redirect("back");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if (err){
                    req.flash("error", "Error creating comment");
                    res.redirect("back");
                } else {
                    comment.author.username = req.user.username;
                    comment.author.id = req.user._id;
                    comment.save();
                    foundEntry.comments.push(comment);
                    foundEntry.save();
                    req.flash("success", "Comment created successfully!");
                    res.redirect("back");
                }
            });
        }
    });
});

router.put("/:comment_id", function(req,res){
    if (req.body.comment.text.length === 0) {
        req.flash("error", "Your comment cannot be empty!");
        return res.redirect("back");
    }
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {new: true}, function(err, updatedComment){
        if (err){
            req.flash("Cannot update comment");
            res.redirect("back");
        } else {
            req.flash("Comment updated successfully!");
            res.redirect("back");
        }
    });
});

router.delete("/:comment_id", function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, removedComment) {
        if (err){
            req.flash("error", "Error removing comment");
            res.redirect("back");
        } else {
             Entry.findByIdAndUpdate(req.params.id, {$pull: {comments: req.params.comment_id}}, {new: true}, function(err, updatedEntry){
                if (err){
                    req.flash("error", "Cannot remove comment");
                    res.redirect("back");
                } else {
                    req.flash("success", "Comment removed!");
                    res.redirect("back");
                    
                }
            });
        }
    });
});

module.exports = router;