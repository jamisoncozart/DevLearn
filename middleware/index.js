//Fetches resource model from /models directory
var Resource = require("../models/campgrounds");
//Fetches Comment model from /models directory
var Comment = require("../models/comment");
//Object to store all middleware for easy exportation
var middlewareObj = {};

//Check if current user owns resource
middlewareObj.checkResourceOwnership = function(req, res, next){
	//If user is authenticated through PassportJS
	if(req.isAuthenticated()){
		//Use the Resource ID (slug) to find a specific resource
		Resource.findOne({slug: req.params.slug}, function(err, foundResource){
			if(err){
				req.flash("error", "Resource not found");
				res.redirect("back");
			} else{
				//If the found resource's author id matches the current user id OR if the user is an Admin
				if(foundResource.author.id.equals(req.user._id) || req.user.isAdmin){
					//Move on to next function (this is middleware)
					next();
				} else{
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		})
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
};

//Check if current user owns comment
middlewareObj.checkCommentOwnership = function(req, res, next){
	//If user is authenticated through PassportJS
	if(req.isAuthenticated()){
		//Find comment using the ID provided in the request
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
			} else{
				//does user own the comment?
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else{
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		})
	} else {
		//send "you did not write that comment" message
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
};

//Check if the user is logged in
middlewareObj.isLoggedIn = function(req, res, next){
	//If user is authenticated by PassportJS run next function
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
};

//export all middleware in middlewareObj object to any JS file that require("index.js") 
module.exports = middlewareObj