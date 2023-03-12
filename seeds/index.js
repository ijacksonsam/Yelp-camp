const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
const Campground = require('../models/campground')
const {indianCities, americanCities ,oldIndianCities} = require('./cities')
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
  for (let i = 0; i < 300; i++) {
    const randCity = indianCities[Math.floor(Math.random() * indianCities.length)]
    // const randCity = americanCities[Math.floor(Math.random() * americanCities.length)] 
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      location: `${randCity.city} , ${randCity.state}`,
      geometry: {
        type: 'Point',
        coordinates:[randCity.lng,randCity.lat]
      },
      title: sample(descriptors) + " " + sample(places),
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis deserunt soluta et laboriosam magni autem quae alias quod in? Rem aut provident voluptatum ipsam, magni harum ut fuga nostrum modi.",
      price,
      author: "640bf875297d8d366fcd9195",
      images: [
        {
          url: 'https://res.cloudinary.com/dfbytcndx/image/upload/v1678506421/YelpCamp/ooivjqcakmaq1rlupt56.jpg',
          filename: 'YelpCamp/ooivjqcakmaq1rlupt56',
        },
        {
          url: 'https://res.cloudinary.com/dfbytcndx/image/upload/v1678506443/YelpCamp/pr25oxkr68bp1fpmedrc.jpg',
          filename: 'YelpCamp/pr25oxkr68bp1fpmedrc',
        }

      ]
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})