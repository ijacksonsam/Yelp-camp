const express = require('express')
const { Passport } = require('passport')
const router = express.Router()
const passport=require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/CatchAsync')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res,next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const regUser = await User.register(user, password)
        req.login(regUser,(err)=>{
            if(err) return next(err)
            req.flash('success', 'successfully registered!!')
            res.redirect('/campgrounds')
        })
        
    }catch(err){
        req.flash('error',err.message)
        res.redirect('/register')
    }
    
}))

router.get('/login',(req,res)=>{
    res.render('users/login')
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login',keepSessionInfo: true}),catchAsync(async(req,res)=>{
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    req.flash('success','welcome back!')
    res.redirect(redirectUrl)
}))

router.get('/logout',(req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err)
        }
        req.flash('success','goodbye!!')
        res.redirect('/campgrounds')
    })
})

module.exports = router