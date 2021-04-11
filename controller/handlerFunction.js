const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/APIFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const modeldata = await Model.findByIdAndDelete(req.params.id);
    if (!modeldata) {
      return next(new AppError('Cannot find the requested', 404));
    }
    res.status(200).json({
      status: 'deleted',
      message: 'successfully deleted',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updateddoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updateddoc) {
      return next(new AppError('Cannot find the requested doc', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        updateddoc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newdoc = await Model.create(req.body); // create method returns a promise that will be handled by async await///
    res.status(201).json({
      stauts: 'success',
      data: {
        Created: newdoc,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    ////Find by can have various methods//
    let query = await Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    let doc = await query;

    if (!doc) {
      return next(new AppError('Cannot find the requested doc', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.GetAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourID) filter = { tour: req.params.tourID };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .page();

    const all_doc = await features.query;
    res.json({
      status: 'success',
      results: all_doc.length,
      data: {
        all_doc,
      },
    });
  });
///////////////////////////////
