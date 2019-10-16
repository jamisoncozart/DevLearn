//require express library to provide easy routing functions to your application (.get(), .post(), .put(), .delete(), etc....)
var express = require("express");
var router = express.Router();
//require all models being called in routes (and all objects being exported by the required files)
var Resource = require("../models/campgrounds");
var Comment = require("../models/comment");

//automatically requires index.js (because index)
var middleware = require("../middleware");

//index route
router.get("/", function(req,res){
	//PAGINATION FEATURE (Bootstrap 4)
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery:1;
	var noMatch = null;
	//Setting up Fuzzy Search functionality (if the is a request query)
	if(req.query.search){
		const regex =  new RegExp(escapeRegex(req.query.search), "gi");
		//find all resources that match user search query and display them using pagination feature
		Resource.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allResources){
			//count how many Resources are included in the query search
			Resource.count({name: regex}).exec(function(err, count){
				if(err){
					console.log(err);
					res.redirect("back");
				} else{
					//if no resources match the query search
					if(allResources.length < 1){
						noMatch = "No resources match that query, please try again";
						req.flash("error", 'No matches were found for "' + req.query.search + '"');
						res.redirect("back");
					} else{
						res.render("campgrounds/index", {
							resources: allResources,
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
		//Get all resources from DB
		Resource.find({}).skip((perPage * pageNumber)-perPage).limit(perPage).exec(function (err, allResources){
			//Count all resources
			Resource.count().exec(function(err, count){
				if(err){
					console.log(err);
				} else{
					res.render("campgrounds/index", {
						resources: allResources,
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

//CREATE Route == add new resource to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add to resource array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	
	//create resource object using the defined variables from user input form
	var newResource = {name: name, price: price, image: image, description: description, author:author}
	//Create a new campground and save to DB
	Resource.create(newResource, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			req.flash("success", "Resource Created!");
			console.log(newlyCreated);
			res.redirect("/campgrounds");
		}
	});
});

//NEW Route == show form to create new resource
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/newCamp");
});

//SHOW Route == shows more info about one resource
router.get("/:slug", function(req,res){
	//find the resource with provided ID
	//populate found resource object with appropriate comments based on id's within the resource's comments object
	Resource.findOne({slug: req.params.slug}).populate("comments likes").exec(function(err, foundResource){
		if(err){
			req.flash("error", "Resource not found")
			res.redirect("back");
		} else{
			//render show template with that campground	
			res.render("campgrounds/show", {resource: foundResource});
		}
	});
	req.params.id;
});

// Resource Like Route (if user likes a post)
router.post("/:slug/like", middleware.isLoggedIn, function (req, res) {
	//find a resource by its unique slug ID
    Resource.findOne({slug: req.params.slug}, function (err, foundResource) {
        if (err) {
            console.log(err);
			console.log("like post error")
            return res.redirect("/campgrounds");
        }
        //find user that liked the post, return user id
        var foundUserLike = foundResource.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        if (foundUserLike) {
            // user already liked, removing like
            foundResource.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundResource.likes.push(req.user);
        }
		//save updated resource schema with new likes to MongoDB
        foundResource.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundResource.slug);
        });
    });
});


//EDIT RESOURCE ROUTE
router.get("/:slug/edit", middleware.checkResourceOwnership, function(req,res){
	Resource.findOne({slug: req.params.slug}, function(err, foundResource){	
		res.render("campgrounds/edit", {resource: foundResource});
	});
});

//UPDATE RESOURCE ROUTE
router.put("/:slug", middleware.checkResourceOwnership, function(req,res){
	//find and update the correct resource by unique slug
	Resource.findOne({slug: req.params.slug}, function(err, resource){
		if(err){
			res.redirect("/campgrounds");
		} else{
			//update resource schema for new data in the user input
			resource.name = req.body.resource.name;
			resource.description = req.body.resource.description;
			resource.image = req.body.resource.image;
			resource.price = req.body.resource.price;
			//save new resource shema information to MongoDB
			resource.save(function (err) {
				if(err){
					console.log(err);
					res.redirect("/campgrounds");
				} else {
					req.flash("success", "Resource Updated!");
					res.redirect("/campgrounds/" + resource.slug);
				}
			});
		}
	});
});

// DESTROY RESOURCE ROUTE
router.delete("/:slug", middleware.checkResourceOwnership, function(req,res){
	
	Resource.findOne({slug: req.params.slug}, function(err, foundResource){
		if(err){
			res.redirect("/campgrounds");
		} else{
			Comment.remove({
				//remove all related comments
				_id: { $in: foundResource.comments },
				function(err, result){
					if (err){
						console.log(err);
					}
				}
			});
			//Remove Resource
			foundResource.remove(function(err){
				if(err){
					res.redirect("back");
				} else {
					req.flash("success", "Resource Deleted!");
					console.log("resource was deleted");
					res.redirect("/campgrounds");
				}
			});
		};
	});
});

//Clean up user query on fuzzy search
function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//export router to any file that require("/resource.js");
module.exports = router;