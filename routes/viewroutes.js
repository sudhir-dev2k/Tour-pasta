const express = require('express');
const { TokenExpiredError } = require('jsonwebtoken');
const router = express.Router();
const Tour = require('./../models/tourmodel');
const AppError = require('./../utils/AppError');
const catchasync = require('./../utils/catchAsync');
const authcontroller = require('./../controller/authcontroller');
const User = require('./../models/UserModel');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const multerStrorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage: multerStrorage });

/* const upload = multer({ dest: 'public/img/users' }); */
router.route('/').get(
  authcontroller.isLoggedIn,
  catchasync(async (req, res, next) => {
    /// get tour data//
    const tours = await Tour.find();
    const users = await User.find();

    // build template//
    ///render tenmplate//
    res.status(200).render('overview', {
      title: 'All tours',
      tours,
      users,
    });
  })
);
router.route('/tour/:name').get(
  authcontroller.isLoggedIn,
  catchasync(async (req, res) => {
    const tour = await Tour.findOne({ name: req.params.name }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
      .render('tour', {
        title: `${tour.name}`,
        tour,
      });
  })
);

router.route('/login').get(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});
router.route('/signup').get(async (req, res) => {
  res.status(200).render('signup', {
    title: 'SignUp',
  });
});

router.route('/me').get(authcontroller.isLoggedIn, (req, res) => {
  res.status(200).render('account', {
    title: 'My Account',
  });
});

router.route('/submit-user-data').post(
  authcontroller.isLoggedIn,
  authcontroller.protect,
  upload.single('photo'),
  catchasync(async (req, res, next) => {
    if (req.file === undefined) {
      const user = await User.findByIdAndUpdate(
        res.locals.user.id,
        {
          name: req.body.name,
          email: req.body.email,
        },

        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).render('account', {
        title: 'My Account',
        user: user,
      });
      next();
    } else {
      const user = await User.findByIdAndUpdate(
        res.locals.user.id,
        {
          name: req.body.name,
          email: req.body.email,
          photo: req.file.filename,
        },

        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).render('account', {
        title: 'My Account',
        user: user,
      });

      next();
    }
  })
);

router.route('/submit-user-password').post(
  authcontroller.isLoggedIn,
  catchasync(async (req, res, next) => {
    console.log(res.locals.user.id);
    const user = await User.findById(res.locals.user.id);
    const check = await user.checkPassword(req.body.password, user.password);
    if (!check)
      return next(new AppError('The current Passowrd does not match'));
    if (check) {
      const password = await bcrypt.hash(req.body.passwordnew, 12);

      const updatedUser = await User.findByIdAndUpdate(
        res.locals.user.id,
        {
          name: res.locals.user.name,
          email: res.locals.user.email,
          password: password,
        },
        { new: true, runValidators: true }
      );
      console.log(updatedUser);
      res.status(200).render('account', {
        title: 'My Account',
        user: updatedUser,
      });
    }

    next();
  })
);

module.exports = router;
