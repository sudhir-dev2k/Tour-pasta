const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { validate } = require('./../models/UserModel');
const nodemailer = require('nodemailer');
const { options } = require('../app');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const cookieparser = require('cookie-parser');
const Cookie = require('js-cookie');

////SIGNJWTFUNC///
const signjwt = (userid) => {
  return jwt.sign({ id: userid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Sign Up User//
const sendtoken = (user, statuscode, res) => {
  const token = signjwt(user._id);

  /* cookieoptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  user.password = undefined;
  if (process.env.NODE_ENV === 'production') cookieoptions.secure = true; */

  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.SignUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  sendtoken(newUser, 201, res);
  next();
});

///////Login User///////

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return next(new AppError('Please Enter an Email Id and a Password!!', 400));
  }
  const user = await User.findOne({ email });

  const authorized = await user.checkPassword(password, user.password);
  console.log(authorized);
  if (!user || !authorized) {
    return next(new AppError('Incorrect Email or Password', 401));
  }
  const token = signjwt(user.id);

  res.status(200).json({
    status: 'Success',
    token,
  });
});
/////Protect Tour routes//////
exports.protect = async (req, res, next) => {
  /* let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookie.jwt;
  } */
  const token = req.cookies.jwt;
  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded.id);
  const Fuser = await User.findById(decoded.id);
  console.log(Fuser);
  if (!Fuser) {
    return next(
      new AppError(
        'You are not registered on our website!! Please login to view the tours'
      ),
      404
    );
  }
  /*   console.log(decoded);
  if (Fuser.changedpassword(decoded.iat)) {
    return next(new AppError('The password was changed recently ', 401));
  } */

  req.user = Fuser;
  next();
};
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const Fuser = await User.findById(decoded.id);
    if (!Fuser) {
      return next();
    }
    console.log(Fuser);
    res.locals.user = Fuser;
    /* next(); */
  }
  return next();
};

/////Protect Delete Tours////
exports.restrictto = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403));
    }
    next();
  };
};

//////FOrgot Password/////
/* 
exports.forgotpassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'If there is an account linked to your email.. You will get a notification!!',
        401
      )
    );
  }
  const token = await user.createpasswordtoken();
  ////SEND MAIL/////
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetpassword/${token}`;
  const message = `Please click on the following link to reset your password, ${resetUrl}`;

  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'b81d086ff99438',
        pass: '1cc3e3538e3873',
      },
    });
    const mailOptions = {
      from: 'Sudhir Sharma',
      to: user.email,
      subject: 'Testing Email for token (valid for 10 mins)',
      text: message,
    };
    await transport.sendMail(mailOptions);
    res.status(200).json({
      status: 'success',
      message: 'token sent to mail',
    });
  } catch (err) {
    user.passwordresettoken = undefined;
    user.passwordresetexpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('error sending the email', 500));
  }
  console.log(req.user);
  next();
});

exports.resetpassword = catchAsync(async (req, res, next) => {
  const HashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordresettoken: HashedToken,
    passwordresetexpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token Expired or token is Not Good'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordresetexpires = undefined;
  user.passwordresettoken = undefined;
  await user.save();

  const token = signjwt(user.id);

  res.status(200).json({
    status: 'Success',
    token,
  });
});
 */
/* exports.UpdatePassword = catchAsync(async (req, res, next) => {
  //Get user from collection///
  const user = await User.findById(req.user.id);
  const name = user.name;
  const email = user.email;
  const password = await user.checkPassword(req.body.password, user.password);
  if (!password) {
    return next(new AppError('Invalid Password', 401));
  }
  (user.password = req.body.newPassword),
    (user.passwordConfirm = req.body.passwordConfirm),
    user.markModified('password');
  await user.save();
  next();
}); */
