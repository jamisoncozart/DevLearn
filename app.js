var express       = require("express"), 
	app        	  = express(), 
	mongoose      = require("mongoose"),
	flash         = require("connect-flash"), 
	bodyParser    = require("body-parser"),
	passport      = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Resource      = require("./models/campgrounds"),
	Comment       = require("./models/comment"),
	seedDB        = require("./seeds"),
	User	      = require("./models/user");

//requiring routes
var commentRoutes    = require("./routes/comments"),
	resourceRoutes = require("./routes/campgrounds"),
	indexRoutes      = require("./routes/index");


mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Luna is the most amazing cat even if she's a bitch",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware that runs on every route to pass req.user (user data if they're logged in) to each page's ejs file for use
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});



app.use(indexRoutes);
app.use("/campgrounds", resourceRoutes);
app.use("/campgrounds/:slug/comments", commentRoutes);

app.listen(3000, function(){
	console.log("YelpCampServer: spinning up on port 3000");
});