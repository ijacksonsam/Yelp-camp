const express=require('express')
const router = express.Router({mergeParams:true})
const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsync = require('../utils/CatchAsync')
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware')


router.post('/',isLoggedIn,validateReview , catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.Review)
    review.author = req.user.id
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success','successfully added review')
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async (req,res)=>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports=router