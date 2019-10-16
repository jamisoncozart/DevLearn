//uses the mongoose library to allow for object modelling on MongoDB server
var mongoose = require("mongoose");
//requires passport local mongoose library to make creating authenticated and encrypted user data storage easier using PassportJS for MongoDB
var passportLocalMongoose = require("passport-local-mongoose");

//define user schema using mongoose
var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	isAdmin: {type: Boolean, default: false}
});

//passportLocalMongoose adds salt value to user schema, hashed password, and adds some methods to the schema for validation
userSchema.plugin(passportLocalMongoose);

//export userSchema as "User" to any file that require("/user.js");
module.exports = mongoose.model("User", userSchema);