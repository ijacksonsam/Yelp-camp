const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder= mbxGeocoding({accessToken:mapBoxToken})

const {cloudinary} = require('../cloudinary')
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm =  (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground =async (req, res, next) => {

    const geoData=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()

    const newCamp = new Campground(req.body.campground)
    newCamp.geometry=geoData.body.features[0].geometry
    newCamp.author = req.user.id
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
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
    console.log(req.body)
    const newCamp=await Campground.findByIdAndUpdate(id, req.body.campground)
    images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCamp.images.push(...images)
    await newCamp.save()
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
          }
        await newCamp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }

    req.flash('success','successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success','successfully deleted campground')
    res.redirect('/campgrounds')
}