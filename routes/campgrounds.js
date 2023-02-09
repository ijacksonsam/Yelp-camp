const express = require('express')
const router=express.Router()
const Campground = require('../models/campground')
const catchAsync = require('../utils/CatchAsync')
const {isLoggedIn,validateCampground,isAuthor} = require('../middleware')



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new',isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author')
    if(!campground){
        req.flash('error','campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground})
}))


router.post('/',isLoggedIn,validateCampground, catchAsync(async (req, res, next) => {

    // if(!req.body.campground) throw new ExpressError('empty campground',400)
    
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user.id
    await newCamp.save()
    req.flash('success','successfully created new campground!!')
    res.redirect(`/campgrounds/${newCamp.id}`)

}))

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id',isLoggedIn,isAuthor,validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params
    await Campground.findByIdAndUpdate(id, req.body.campground)
    req.flash('success','successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success','successfully deleted campground')
    res.redirect('/campgrounds')
}))

module.exports=router