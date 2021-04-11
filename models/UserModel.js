const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'PLease enter a username'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please enter an email address'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'guide', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please Provide password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please fill password confirmation'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords Don't Match",
    },
  },
  passwordchangedat: { type: Date, selected: true },
  passwordresettoken: String,
  passwordresetexpires: Date,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.methods.checkPassword = async function (
  EnteredPassword,
  UserPassword
) {
  return await bcrypt.compare(EnteredPassword, UserPassword);
};

UserSchema.methods.changedpassword = async function (JWTTimeStamp) {
  if (this.passwordchangedat) {
    const passwordtime = parseInt(this.passwordchangedat.getTime() / 1000, 10);
    console.log(passwordtime);
    console.log(JWTTimeStamp < passwordtime);
    return JWTTimeStamp < passwordtime;
  }
  return false;
};
UserSchema.methods.createpasswordtoken = function () {
  const resettoken = crypto.randomBytes(32).toString('hex');
  this.passwordresettoken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');
  this.passwordresetexpires = Date.now() + 10 * 60 * 1000;
  console.log(this.passwordresettoken);
  return resettoken;
};
const User = mongoose.model('User', UserSchema);
module.exports = User;
