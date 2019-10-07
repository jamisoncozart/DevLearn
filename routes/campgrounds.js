var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");

//automatically requires index.js (because index)
var middleware = require("../middleware");

//index route
router.get("/", function(req,res){
	//Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
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
router.get("/:id", function(req,res){
	//find the campground with provided ID
	//populate found campground object with appropriate comments based on id's within the campground's comments object
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
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
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){	
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground Updated!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else{
			req.flash("success", "Campground Deleted!");
			console.log("campsite was deleted");
			res.redirect("/campgrounds");
		}
	});
});

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};



module.exports = router;