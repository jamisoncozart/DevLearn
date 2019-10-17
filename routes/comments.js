//require all necessary libraries and files
var express = require("express");
var router = express.Router({mergeParams: true});
var Resource = require("../models/resources"),
	Comment    = require("../models/comment");
var middleware = require("../middleware");

//Show newComments page
router.get("/new", middleware.isLoggedIn, function(req, res){
	//find resource by id
	Resource.findOne({slug: req.params.slug}, function(err, resource){
		if(err){
			console.log(err);
		} else{
			res.render("comments/newComment", {resource: resource});
		}
	});
});

//Post request to create comment in DB and display it
router.post("/", middleware.isLoggedIn, function(req,res){
	//Look up resource using id
	Resource.findOne({slug: req.params.slug}, function(err, resource){
		if(err){
			console.log(err);
			res.redirect("/resources");
		} else{
			//If no error, create comment based on user entered comment from req.body.comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else{
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment to MongoDB
					comment.save();
					resource.comments.push(comment);
					resource.save();
					console.log(comment);
					//redirect to resource show page that should display new comment
					req.flash("success", "Comment Created!");
					res.redirect("/resources/" + resource.slug);
				}
			});
		}
	});
});

//COMMENTS EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
	//find resource by slug
	Resource.findOne({slug: req.params.slug}, function(err, foundResource){
		if(err || !foundResource){
			req.flash("error", "No resource found");
			return res.redirect("back");
		}	
		//find comment by its ID
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect("back");
			} else{
				//render comment edit form
				res.render("comments/edit", {resource_slug: req.params.slug, comment: foundComment});
			}
		});
	});
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res){
	//find comment and update it based on user input from req.body.comment
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment Editted!");
			//redirect to resource show page that should display newly editted comment
			res.redirect("/resources/" + req.params.slug);
		}
	});
});

//COMMENT DELETE ROUTE
// router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
// 	Comment.findByIdAndRemove(req.params.comment_id, function(err){
// 		if(err){
// 			res.redirect("back");
// 		} else {
// 			Resource.findByIdAndUpdate(req.params.id, {
// 				$pull: {
// 					comments: req.params.comment_id
// 				}
// 			}, function(err, data){
// 				if(err){
// 					console.log(err);
// 				} else{
// 					req.flash("success", "Comment Deleted!");
// 					res.redirect("/resources/" + req.params.slug);
// 				}
// 			});
// 		}
// 	});
// });

//COMMENT DELETE ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
	//udpate resource to no longer include deleted comment by pulling it out of the resource object by its req.params.comment_id
	Resource.update({slug: req.params.slug}, {$pull: {comments: req.params.comment_id}}, function(err, resource){
			if(err){
				console.log(err);
			} else{
				req.flash("success", "Comment Deleted!");
				//redirect to resource show page that should no longer display deleted comment
				res.redirect("/resources/" + req.params.slug);
			}
	});
});

//export router object to be used in other files that require("/comments.js")
module.exports = router;