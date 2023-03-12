const mongoose = require('mongoose')
const { campgroundSchema } = require('../JoiSchemas')
const Schema = mongoose.Schema
const Review = require('./review')

const ImageSchema = new Schema({
    url:String,
    filename:String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200,h_150,c_fill')
})

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    description: String,
    location: String,
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    images: [ImageSchema],
    reviews: [{
        type: Schema.Types.ObjectId, ref: 'Review'
    }]
})

CampgroundSchema.set('toJSON', { virtuals: true });

CampgroundSchema.virtual('properties.popup').get(function () {
    return `<h5><a href="/campgrounds/${this.id}">${this.title}</a></h5>
    <p class="card-subtitle mb-2 text-muted">${this.location}</p>`;
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', CampgroundSchema)