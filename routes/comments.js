var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds"),
	Comment    = require("../models/comment");
var middleware = require("../middleware");

//comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
	//find campground by id
	Campground.findOne({slug: req.params.slug}, function(err, campground){
		if(err){
			console.log(err);
		} else{
			res.render("comments/newComment", {campground: campground});
		}
	});
});

//comments create
router.post("/", middleware.isLoggedIn, function(req,res){
	//look up campground using id
	Campground.findOne({slug: req.params.slug}, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else{
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					req.flash("success", "Comment Created!");
					//might need a fix=========================================================================
					res.redirect("/campgrounds/" + campground.slug);
				}
			});
		}
	});
});

//COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "No campground found");
			return res.redirect("back");
		}	
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			} else{
				res.render("comments/edit", {campground_slug: req.params.slug, comment: foundComment});
			}
		});
	});
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment Editted!");
			res.redirect("/campgrounds/" + req.params.slug);
		}
	});
});

//COMMENT DELETE ROUTE
// router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
// 	Comment.findByIdAndRemove(req.params.comment_id, function(err){
// 		if(err){
// 			res.redirect("back");
// 		} else {
// 			Campground.findByIdAndUpdate(req.params.id, {
// 				$pull: {
// 					comments: req.params.comment_id
// 				}
// 			}, function(err, data){
// 				if(err){
// 					console.log(err);
// 				} else{
// 					req.flash("success", "Comment Deleted!");
// 					res.redirect("/campgrounds/" + req.params.slug);
// 				}
// 			});
// 		}
// 	});
// });

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
	Campground.update({slug: req.params.slug}, {$pull: {comments: req.params.comment_id}}, function(err, campground){
			if(err){
				console.log(err);
			} else{
				req.flash("success", "Comment Deleted!");
				res.redirect("/campgrounds/" + req.params.slug);
			}
	});
});

module.exports = router;