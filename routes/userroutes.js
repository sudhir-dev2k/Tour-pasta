const express = require('express');
const authcontroller = require('./../controller/authcontroller');
////controllers///

const UserController = require('../controller/UserRoutes');

////User Routes////
const router = express.Router();
router
  .route('/me')
  .get(authcontroller.protect, UserController.GetMe, UserController.getuser);
router.route('/signup').post(authcontroller.SignUp);

router.route('/login').post(authcontroller.login);
/* router.route('/forgotpassword').post(authcontroller.forgotpassword);
router.route('/resetpassword/:token').patch(authcontroller.resetpassword); */
/* outer
  .route('/updatepassword')
  .post(authcontroller.protect, authcontroller.UpdatePassword); */
router
  .route('/')
  .get(
    authcontroller.protect,
    authcontroller.restrictto('admin'),
    UserController.getallusers
  )
  .post(UserController.createnewuser);
router
  .route('/:id')
  .get(UserController.getuser)
  .patch(authcontroller.protect, UserController.updateuser)
  .delete(authcontroller.protect, UserController.deleteuser);

module.exports = router;
