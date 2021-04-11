const Tour = require('./../models/tourmodel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./handlerFunction');
///////read all tours from the Document///
exports.getalltours = factory.GetAll(Tour);

////////////create Tour//////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////Get a Specific tour//////
exports.gettour = factory.getOne(Tour, { path: 'reviews' }); ///
exports.createnewtour = factory.createOne(Tour);
exports.updatetour = factory.updateOne(Tour);
exports.deletetour = factory.deleteOne(Tour);

exports.top_cheap = catchAsync(async (req, res, next) => {
  let resultquery = Tour.find();
  resultquery = resultquery
    .sort('-ratingsAverage,price')
    .limit(5)
    .select('name duration ratingsAverage price summary');

  const all_tours = await resultquery;

  ///response
  res.json({
    status: 'success',
    results: all_tours.length,
    data: {
      all_tours,
    },
  });
});
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});

/////Business Probemlem//
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date('2022-01-01'),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { month: 1 },
    },
    {
      $limit: 4,
    },
  ]);
  res.status(200).json({
    status: 'Success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
