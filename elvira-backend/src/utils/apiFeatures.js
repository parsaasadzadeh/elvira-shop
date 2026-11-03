const { escapeRegex } = require("./validators");
const { getPagination } = require("./pagination");

const GENDERS = ["men", "women", "kids", "unisex"];
const text = (v) => (typeof v === "string" ? v.trim() : "");

class ApiFeatures {
  constructor(query, queryString = {}) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    const s = text(this.queryString.search).slice(0, 100);
    if (s) {
      this.query = this.query.find({
        title: { $regex: escapeRegex(s), $options: "i" },
      });
    }
    return this;
  }

  filter() {
    const q = this.queryString;
    const filterQuery = {};

    const category = text(q.category);
    if (category) filterQuery.category = category;

    const gender = text(q.gender);
    if (GENDERS.includes(gender)) filterQuery.gender = gender;

    if (text(q.featured) === "true") filterQuery.isFeatured = true;

    const min = Number(text(q.minPrice));
    const max = Number(text(q.maxPrice));
    if ((text(q.minPrice) && Number.isFinite(min)) || (text(q.maxPrice) && Number.isFinite(max))) {
      filterQuery.finalPrice = {};
      if (text(q.minPrice) && Number.isFinite(min)) filterQuery.finalPrice.$gte = min;
      if (text(q.maxPrice) && Number.isFinite(max)) filterQuery.finalPrice.$lte = max;
    }

    this.query = this.query.find(filterQuery);
    return this;
  }

  sort() {
    const map = { price_asc: "finalPrice", price_desc: "-finalPrice", newest: "-createdAt" };
    this.query = this.query.sort(map[text(this.queryString.sort)] || "-createdAt");
    return this;
  }

  paginate() {
    const { page, limit, skip } = getPagination(this.queryString, {
      defaultLimit: 12,
      maxLimit: 50,
    });
    this.page = page;
    this.limit = limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
