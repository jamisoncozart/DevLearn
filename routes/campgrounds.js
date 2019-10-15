var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

//automatically requires index.js (because index)
var middleware = require("../middleware");

//index route
router.get("/", function(req,res){
	//PAGINATION FEATURE
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery:1;
	var noMatch = null;
	//PAGINATION FEATURE
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), "gi");
		Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds){
			Campground.count({name: regex}).exec(function(err, count){
				if(err){
					console.log(err);
					res.redirect("back");
				} else{
					if(allCampgrounds.length < 1){
						noMatch = "No resources match that query, please try again";
						req.flash("error", 'No matches were found for "' + req.query.search + '"');
						res.redirect("back");
					} else{
						res.render("campgrounds/index", {
							campgrounds: allCampgrounds,
							current: pageNumber,
							pages: Math.ceil(count/perPage),
							noMatch: noMatch,
							search: req.query.search
						});
					}
				}
			});
		});
			
	} else{
		//Get all campgrounds from DB
		Campground.find({}).skip((perPage * pageNumber)-perPage).limit(perPage).exec(function (err, allCampgrounds){
			Campground.count().exec(function(err, count){
				if(err){
					console.log(err);
				} else{
					res.render("campgrounds/index", {
						campgrounds: allCampgrounds,
						current: pageNumber,
						pages: Math.ceil(count / perPage),
						noMatch: noMatch,
						search: false
					});
				}
			});
		});
	}
});

//CREATE Route == add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
	  id: req.user._id,
	  username: req.user.username
  };
  var newCampground = {name: name, price: price, image: image, description: description, author:author}
  //Create a new campground and save to DB
  Campground.create(newCampground, function(err, newlyCreated){
 	if(err){
		console.log(err);
	} else{
		req.flash("success", "Resource Created!");
		console.log(newlyCreated);
		res.redirect("/campgrounds");
	}
  });
});

//NEW Route == show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/newCamp");
});

//SHOW Route == shows more info about one campground
router.get("/:slug", function(req,res){
	//find the campground with provided ID
	//populate found campground object with appropriate comments based on id's within the campground's comments object
	Campground.findOne({slug: req.params.slug}).populate("comments likes").exec(function(err, foundCampground){
		if(err){
			req.flash("error", "Resource not found")
			res.redirect("back");
		} else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	req.params.id;
	//render show template with that campground	
});

// Campground Like Route
router.post("/:slug/like", middleware.isLoggedIn, function (req, res) {
    Campground.findOne({slug: req.params.slug}, function (err, foundCampground) {
        if (err) {
            console.log(err);
			console.log("like post error")
            return res.redirect("/campgrounds");
        }
        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }
        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground.slug);
        });
    });
});


//EDIT CAMPGROUND ROUTE
router.get("/:slug/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){	
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:slug", middleware.checkCampgroundOwnership, function(req,res){
	//find and update the correct campground
	Campground.findOne({slug: req.params.slug}, function(err, campground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			campground.image = req.body.campground.image;
			campground.price = req.body.campground.price;
			campground.save(function (err) {
				if(err){
					console.log(err);
					res.redirect("/campgrounds");
				} else {
					req.flash("success", "Resource Updated!");
					res.redirect("/campgrounds/" + campground.slug);
				}
			});
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:slug", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			Comment.remove({
				//remove all related comments
				_id: { $in: foundCampground.comments },
				function(err, result){
					if (err){
						console.log(err);
					}
				}
			});
			//Remove Campground
			foundCampground.remove(function(err){
				if(err){
					res.redirect("back");
				} else {
					req.flash("success", "Resource Deleted!");
					console.log("campsite was deleted");
					res.redirect("/campgrounds");
				}
			});
		};
	});
});

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;