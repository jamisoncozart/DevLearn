//uses the mongoose library to allow for object modelling on MongoDB server
var mongoose = require("mongoose");

//define comment schema using mongoose schema
var commentSchema = new mongoose.Schema({
	text: String,
	createdAt: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

//exporting mongoose comment model as "Comment" to any file that require("/comment.js");
module.exports = mongoose.model("Comment", commentSchema);