const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
const Campground = require('../models/campground')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error :"));
db.once('open', () => {
    console.log('database connected')
})

const sample = arr => arr[Math.floor(Math.random() * arr.length)]


const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const randCity = cities[Math.floor(Math.random() * cities.length)]
        const price = Math.floor(Math.random()*20) + 10
        const camp = new Campground({
            location: `${randCity.city} , ${randCity.state}`,
            title: sample(descriptors) + " " + sample(places),
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis deserunt soluta et laboriosam magni autem quae alias quod in? Rem aut provident voluptatum ipsam, magni harum ut fuga nostrum modi.",
            image:"https://source.unsplash.com/collection/483251",
            price,
            author:"63e3b2a9fba290e3762bc9e9"
        })
        await camp.save()
    }
}

seedDB().then(()=>{
    mongoose.connection.close()
})