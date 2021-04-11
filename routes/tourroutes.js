const express = require('express');
const authcontroller = require('./../controller/authcontroller');
const reviewController = require('./../controller/reviewController');
const tourcontroller = require('../controller/TourRoutes');
const router = express.Router();
router.route('/top-5-cheap').get(tourcontroller.top_cheap);
router.route('/stats').get(tourcontroller.getTourStats);
router.route('/monthly/:year').get(tourcontroller.getMonthlyPlan);
router
  .route('/')
  .get(tourcontroller.getalltours)
  .post(
    authcontroller.protect,
    authcontroller.restrictto('admin'),
    tourcontroller.createnewtour
  );
router
  .route('/:id')
  .get(tourcontroller.gettour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictto('admin'),
    tourcontroller.updatetour
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictto('admin'),
    tourcontroller.deletetour
  );
router
  .route('/:tourID/reviews')
  .get(reviewController.getAllReviews)
  .post(
    authcontroller.protect,
    authcontroller.restrictto('user'),
    reviewController.createReview
  );
module.exports = router;
