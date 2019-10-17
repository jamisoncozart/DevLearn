var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req,res){
	res.render("landing");
});

//show register form
router.get("/register", function(req,res){
	res.render("register");
});

//handle sign up logic
router.post("/register", function(req,res){
	var newUser = new User({username: req.body.username});
	//CREATING ADMIN ROLE IF CORRECT ADMIN CODE
	//eval(require("locus"));
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("register");
		} 
		passport.authenticate("local")(req,res, function(){
			req.flash("success", "Signup Successful!");
			res.redirect("/resources");
		});
	});
});

//show login form
router.get("/login", function(req,res){
	res.render("login");
});

//handle login logic
//app.post("/login", middleware, callbackFunction)
router.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/resources", failureRedirect: "/login"
	}), function(req,res){
});

//logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logout Successful");
	res.redirect("/resources");
});

//middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

module.exports = router;