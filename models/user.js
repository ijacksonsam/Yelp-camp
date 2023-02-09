const mongoose=require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
})


userSchema.post('save',function(error,doc,next){
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(new Error(`the given email '${doc.email}' is already taken!!`));
      } else {
        next(); // The `update()` call will still error out.
      }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User',userSchema)