const catchAsync = require('./../utils/catchAsync');
const express = require('express');
const User = require('./../models/UserModel');
const factory = require('./handlerFunction');

////controllers//
exports.getallusers = factory.GetAll(User);
exports.getuser = factory.getOne(User);
exports.createnewuser = (req, res) => {
  res.status(200).json({
    status: 'success',
  });
};
exports.GetMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateuser = factory.updateOne(User);

exports.deleteuser = factory.deleteOne(User);
/* exports.UpdateMe; */
////User Routes////
