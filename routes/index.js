//require and define all libraries and files needed
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//render landing page when root route "/" is requested
router.get("/", function(req,res){
	res.render("landing");
});

//render user register form when "/register" route is requested
router.get("/register", function(req,res){
	res.render("register");
});

//Post request to sign user up
router.post("/register", function(req,res){
	//create new newUser variable that takes the username from the signup form as req.body.username
	var newUser = new User({username: req.body.username});
	//==========
	//used to pause signup logic and create admin role if needed
	//eval(require("locus"));
	//==========
	//Registers new user model using PassportJS built in register function, taking newUser and password provided by user in req.body.password
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("register");
		} 
		//Authenticates user using built in PassportJS function. If successful, user will be created and redirected to the resource home page
		passport.authenticate("local")(req,res, function(){
			req.flash("success", "Signup Successful!");
			res.redirect("/resources");
		});
	});
});

//Render login page when a get request is made to "/login" route
router.get("/login", function(req,res){
	res.render("login");
});

//If Post request made to "/login" route, run PassportJS built in functionality to authenticate user login.
router.post("/login", passport.authenticate("local", 
	{
	//Redirects based on outcome of login authentication
	successRedirect: "/resources", failureRedirect: "/login"
	}), function(req,res){
	//Nothing, silly!
});

//If Get request made to "/logout" route, PassportJS will terminate current login session for current user
router.get("/logout", function(req,res){
	//Built in PassportJS function. (Ends Login Session)
	req.logout();
	req.flash("success", "Logout Successful");
	//redirect to resource homepage
	res.redirect("/resources");
});

//Export router object to be used in any file that require("/index.js");
module.exports = router;