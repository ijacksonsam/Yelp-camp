const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/CatchAsync')

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
    const campground = await Campground.findById(id)
    res.render('campgrounds/show', { campground })
}))


app.post('/campgrounds', catchAsync(async (req, res, next) => {

    const newCamp = new Campground(req.body.campground)
    await newCamp.save()
    res.redirect(`/campgrounds/${newCamp.id}`)

}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.Campground)
    res.redirect(`/campgrounds/${req.params.id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
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