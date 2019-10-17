// var mongoose = require("mongoose");
// var Resource = require("./models/resources");
// var Comment = require("./models/comment");

// var data = [
// 	{
// 		 name: "Full-Stack Web Dev Bootcamp - Udemy", 
// 		 image: "https://i0.wp.com/beprogrammeronline.com/wp-content/uploads/2018/05/15-BEST-UDEMY-COURSES-TO-LEARN-WEB-DEVELOPMENT.jpg?fit=2028%2C1152&ssl=1", 
//		 slug: "",
//		 price: "",
// 		 description: "",
//		 createdAt: ""
// 	},
// 	{
// 		 name: "", 
// 		 image: "", 
// 		 description: ""
// 	},
// 	{
// 		 name: "", 
// 		 image: "", 
// 		 description: ""
// 	}
// ]

// function seedDB(){
// 	//Remove all Resources
// 	Resource.remove({}, function(err){
// 		if(err){
// 			console.log(err);
// 		}
// 		console.log("removed resources");
// 		//add a few resources
// 		data.forEach(function(seed){
// 			Resource.create(seed, function(err, resources){
// 				if(err){
// 					console.log(err);
// 				} else{
// 					console.log("added resource");
// 					//create comment on each resource
// 					Comment.create(
// 						{
// 							text: "This place is great, but I wish their was service...",
// 							author: "Homer"
// 						}, function(err, comment){
// 							 if(err){
// 								 console.log(err);
// 							 } else{
// 								 resources.comments.push(comment);
// 								 resources.save();
// 								 console.log("created new comment");
// 							 }
// 						});
// 				}
// 			});
// 		});
// 	});
// };

// module.exports = seedDB;