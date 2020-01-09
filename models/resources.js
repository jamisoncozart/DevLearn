//uses the mongoose library to allow for object modelling on MongoDB server
var mongoose = require("mongoose");

//Defining the resource object schema using mongoose
var resourceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: "Resource name cannot be blank."
	},
	slug: {
		type: String,
		unique: true
	},
	price: String,
	image: String,
	description: String,
	createdAt: {type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

// add a slug before the resource gets saved to the database
resourceSchema.pre('save', async function (next) {
    try {
        // check if a new resource is being saved, or if the resource name is being modified
        if (this.isNew || this.isModified("name")) {
            this.slug = await generateUniqueSlug(this._id, this.name);
        }
        next();
    } catch (err) {
        next(err);
    }
});

//Generates a unique semantic URL id taking the original ID, the name of the resource, and returning the newly created slug
async function generateUniqueSlug(id, resourceName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(resourceName);
        }
        // check if a resource with the slug already exists
        var resource = await Resource.findOne({slug: slug});
        // check if a resource was found or if the found resource is the current resource
        if (!resource || resource._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        var newSlug = slugify(resourceName);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, resourceName, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

//Will create a semantic URL ID using a string name passed into it.
function slugify(text) {
    var slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}

//defining mongoose resource model under new variable and exporting for use in any file that require("/resources.js")
var Resource = mongoose.model("Resource", resourceSchema);
module.exports = Resource;