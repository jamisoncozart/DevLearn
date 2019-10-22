// Require all libraries and files needed
var express       = require("express"), 
	app        	  = express(), 
	mongoose      = require("mongoose"),
	flash         = require("connect-flash"), 
	bodyParser    = require("body-parser"),
	passport      = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Resource      = require("./models/resources"),
	Comment       = require("./models/comment"),
	seedDB        = require("./seeds"),
	User	      = require("./models/user");

//requiring all routes and assigning them to easy-to-call variables
var commentRoutes    = require("./routes/comments"),
	resourceRoutes = require("./routes/resources"),
	indexRoutes      = require("./routes/index");


//Define url to use environmental variable to prevent showing server login information on GitHub
var url = process.env.DATABASEURL || "mongodb://localhost/DevLearn"
//Connect to mongoDB server using mongoose functionality
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
//Allows for easily pulling variables out of request HTML by providing req.body.[variable name] request calling


app.use(bodyParser.urlencoded({extended:true}));
//All files referenced in responses will be assumed to be ejs files (allows for calling file names without adding ".ejs" at the end of the files)
app.set("view engine", "ejs");
//Allows access of ".css" files in the "/public" directory
app.use(express.static(__dirname + "/public"));
//Allows for PUT and DELETE HTTP requests to be made (because the client doesn't support it natively...)
app.use(methodOverride("_method"));
//Allows for flash messages to be displayed if success or error responses are sent
app.use(flash());

//Requires Moment.js library to allow for time tracking on posts to display how long ago a resource or comment was created
app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Luna is the most amazing cat even if she's a bitch",
	resave: false,
	saveUninitialized: false
}));

//PassportJS Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware that runs on every route to pass current User (req.user) (user data if they're logged in) to each page's ejs file for use
//basically creates a logged-in session
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


//Allows for shorter URL references in other route pages by assuming the beginning of the URL for some routes.
app.use(indexRoutes);
app.use("/resources", resourceRoutes);
app.use("/resources/:slug/comments", commentRoutes);


//Start a server listening for connections (if successful will console.log) (connects to mongoDB)
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("DevLearnServer: spinning up");
});