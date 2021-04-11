const express = require('express');
const reviewController = require('./../controller/reviewController');
const authcontroller = require('./../controller/authcontroller');

const router = express.Router();
router.use(authcontroller.protect);
router.route('/').get(reviewController.getAllReviews);
router.route('/').post(
  authcontroller.restrictto('user'),

  reviewController.createReview
);
router
  .route('/:id')
  .get(reviewController.GetOneReview)
  .delete(
    authcontroller.restrictto('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authcontroller.restrictto('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
