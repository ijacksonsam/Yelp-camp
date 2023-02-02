const express=require('express')
const router = express.Router({mergeParams:true})
const {reviewSchema} = require('../JoiSchemas')
const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsync = require('../utils/CatchAsync')

const validateReview = function(req,res,next){
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=> el.message).join()
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}

router.post('/',validateReview , catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.Review)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success','successfully added review')
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.delete('/:reviewId',catchAsync(async (req,res)=>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports=router