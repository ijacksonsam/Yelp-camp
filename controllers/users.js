const User= require('../models/user')

module.exports.renderRegister=(req, res) => {
    res.render('users/register')
}

module.exports.register=async (req, res,next) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ username, email })
        const regUser = await User.register(user, password)
        req.login(regUser,(err)=>{
            if(err) return next(err)
            req.flash('success', 'successfully registered!! welcome '+req.user.username)
            res.redirect('/campgrounds')
        })
        
    }catch(err){
        req.flash('error',err.message)
        res.redirect('/register')
    }
    
}

module.exports.renderLogin =(req,res)=>{
    res.render('users/login')
}

module.exports.login = async(req,res)=>{
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    req.flash('success',`welcome back ${req.user.username}!`)
    res.redirect(redirectUrl)
}

module.exports.logout = (req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err)
        }
        req.flash('success','goodbye!!')
        res.redirect('/campgrounds')
    })
}