class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  //Filter method for url
  filter() {
    const QueryObj = { ...this.queryString };
    const excludes = ['page', 'sort', 'limit', 'fields'];
    excludes.forEach((el) => {
      delete QueryObj[el];
    });
    let queryStr = JSON.stringify(QueryObj);
    queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (m) => {
      return `$${m}`;
    });
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  //Sorting method for url
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  ///field limiting
  limit() {
    if (this.queryString.fields) {
      const fieldquery = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldquery);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  /////Pagination//
  page() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
