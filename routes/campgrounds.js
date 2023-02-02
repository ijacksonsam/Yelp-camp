const express = require('express')
const router=express.Router()
const {campgroundSchema} = require('../JoiSchemas')
const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/CatchAsync')

const validateCampground = (req,res,next)=>{
    
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg= error.details.map( el => el.message).join()
        throw new ExpressError(msg,400)
    }else{
        next()
    }

}


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews')
    if(!campground){
        req.flash('error','campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground})
}))


router.post('/',validateCampground, catchAsync(async (req, res, next) => {

    // if(!req.body.campground) throw new ExpressError('empty campground',400)
    
    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    req.flash('success','successfully created new campground!!')
    res.redirect(`/campgrounds/${newCamp.id}`)

}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id',validateCampground, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    req.flash('success','successfully updated campground')
    res.redirect(`/campgrounds/${req.params.id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success','successfully deleted campground')
    res.redirect('/campgrounds')
}))

module.exports=router