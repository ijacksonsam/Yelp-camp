const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.Review)
    review.author = req.user.id
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success','successfully added review')
    res.redirect(`/campgrounds/${campground.id}`)
}

module.exports.deleteReview = async (req,res)=>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}