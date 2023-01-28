const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const {campgroundSchema,reviewSchema} = require('./JoiSchemas')
const Campground = require('./models/campground')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/CatchAsync')
const Review = require('./models/review')


const path = require('path')
const app = express()
mongoose.set('strictQuery', false);


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
// .then(data=>{
//     console.log('connected to db')
// })
// .catch(err=>{
//     console.log(err)
// })

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error :"));
db.once('open', () => {
    console.log('database connected')
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))

const validateCampground = (req,res,next)=>{
    
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg= error.details.map( el => el.message).join()
        throw new ExpressError(msg,400)
    }else{
        next()
    }

}

const validateReview = function(req,res,next){
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=> el.message).join()
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews')
    res.render('campgrounds/show', { campground })
}))


app.post('/campgrounds',validateCampground, catchAsync(async (req, res, next) => {

    // if(!req.body.campground) throw new ExpressError('empty campground',400)
    
    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp.id}`)

}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.Campground)
    res.redirect(`/campgrounds/${req.params.id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews',validateReview , catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.Review)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect(`/campgrounds/${campground.id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async (req,res)=>{
    const {id,reviewId} = req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all('*',(req,res,next)=>{
    next(new ExpressError('page not found',404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render('error' , {err})
})


app.listen(3000, () => {
    console.log('serving on port 3000')
})