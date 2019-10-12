var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");

//automatically requires index.js (because index)
var middleware = require("../middleware");

//index route
router.get("/", function(req,res){
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), "gi");
		Campground.find({name: regex}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else{
				if(allCampgrounds.length < 1){
					req.flash("error", 'No matches were found for "' + req.query.search + '"');
					res.redirect("back");
				} else{
					res.render("campgrounds/index", {campgrounds: allCampgrounds});
				}
			}
		});
	} else{
		//Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else{
				res.render("campgrounds/index", {campgrounds: allCampgrounds});
			}
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
		req.flash("success", "Campground Created!");
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
	Campground.findOne({slug: req.params.slug}).populate("comments").exec(function(err, foundCampground){
		if(err){
			req.flash("error", "Campground not found")
			res.redirect("back");
		} else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	req.params.id;
	//render show template with that campground	
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
					req.flash("success", "Campground Updated!");
					res.redirect("/campgrounds/" + campground.slug);
				}
			});
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:slug", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findOneAndRemove({slug: req.params.slug}, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground Deleted!");
			console.log("campsite was deleted");
			res.redirect("/campgrounds");
		}
	});
});

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;