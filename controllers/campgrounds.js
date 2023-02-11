const Campground = require('../models/campground')
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm =  (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground =async (req, res, next) => {

    // if(!req.body.campground) throw new ExpressError('empty campground',400)
    
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user.id
    await newCamp.save()
    req.flash('success','successfully created new campground!!')
    res.redirect(`/campgrounds/${newCamp.id}`)

}

module.exports.showCampground =async (req, res) => {
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
}

module.exports.renderEditForm=async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params
    await Campground.findByIdAndUpdate(id, req.body.campground)
    req.flash('success','successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success','successfully deleted campground')
    res.redirect('/campgrounds')
}