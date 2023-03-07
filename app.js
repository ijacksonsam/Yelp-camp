if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash=require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes=require('./routes/users')
const app = express()
const passport = require('passport')
const localStrategy=require('passport-local')
const User = require('./models/user')


const path = require('path')
mongoose.set('strictQuery', false);


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error :"));
db.once('open', () => {
    console.log('database connected')
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const sessionConfig = {
    secret:'thisisabadsecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser=req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    return next();
})

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,'public')))



app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.get('/', (req, res) => {
    res.render('home')
})


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