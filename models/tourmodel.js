///////////tour schema//////
const mongoose = require('mongoose');
const slugify = require('slugify');
const { default: validator } = require('validator');
const user = require('./UserModel');
const Review = require('./reviewModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour name is required'],
      unique: true,
      maxlength: [40, 'A tour cannot have more than 40 letters'],
      minlength: [10, 'A tour must have more than 10 characters'],
      /* validate: [validator.isAlpha, 'tourname must only contain characters'], */
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, ' A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true],
      enum: ['easy', 'medium', 'difficult'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, 'the minimum number of ratings average should be 2'],
      max: [5, 'the ratings cannot be more than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    DiscountPrice: {
      type: Number,
      validate: {
        ///only works when creating new doc
        validator: function (val) {
          return val < this.price;
        },
        message: `Discount {{VALUE}} cannot be more than the actual price`,
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'Image is required'],
    },
    images: [String],
    createdAt: {
      select: false,
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    SecretTour: {
      type: Boolean,
      deafult: false,
    },
    startLocation: {
      ///GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual objects //Not shown in the db
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationweeks').get(function () {
  return (this.duration / 7).toPrecision(3);
});
///DOC middlware//Runs before the .save(),.create()save command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await user.findById(id));
  this.guides = await Promise.all(guidesPromises);

  next();
});

tourSchema.pre('save', function (next) {
  console.log('will save document');
  next();
});
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

/// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ SecretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-password',
  });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviews',
    select: 'review',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`${Date.now() - this.start}`);
  next();
});

///aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { SecretTour: { $ne: true } } });
  next();
});

/////Creating the model from our schema///
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

////Methods on databse model///
/* testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('error', err);
  });
 */
