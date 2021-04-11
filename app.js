const { json } = require('express');
const path = require('path');
const AppError = require('./utils/AppError');
const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieparser = require('cookie-parser');
//Start express app
const app = express();

const reviewRouter = require('./routes/reviewroutes');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); //s

//app.use(helmet()); ////HTTP headers

const limiter = ratelimit({
  ///Rate limiter
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Requests from this ip',
});
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieparser()); ///bodyparser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongosanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

////Tour and user router//
const tourRouter = require('./routes/tourroutes');
const userRouter = require('./routes/userroutes');
const viewrouter = require('./routes/viewroutes');

app.use('/', viewrouter);
app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});
const handletokenerror = (err) => {
  new AppError('Login Again PLease', 401);
};

const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  console.log(value);

  const message = 'duplicate fields detected';
};

app.use((err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      });
    }
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'JsonWebTokenError') error = handletokenerror(error);
  }
});

//////server/////
module.exports = app;
