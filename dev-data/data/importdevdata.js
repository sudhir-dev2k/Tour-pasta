const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const Tour = require('./../../models/tourmodel');
const User = require('./../../models/UserModel');
const Review = require('./../../models/reviewModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,

    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

///read json files///
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

/////import data into database////
const importdata = async () => {
  try {
    await Tour.insertMany(tours);
    await User.insertMany(users, { validateBeforeSave: false });
    await Review.insertMany(reviews);

    console.log('Data succesfully Created');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const tourdel = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv.find((ele) => ele == '--import')) {
  importdata();
}
if (process.argv.find((ele) => ele == '--delete')) {
  tourdel();
}

console.log(process.argv);
