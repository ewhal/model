"use strict";

/**
 * Query builder class
 */
class DbQuery {
  /**
   * Construct query builder class
   */
  constructor (Model, db) {
    // Store internal copy of the Model protoype
    this._Model = Model;

    // Store internal copy of the DB API
    this._db = db;

    // Query parts
    this.pts = [];
  }

  /**
   * Set maximum returned Model instances
   */
  limit (amt) {
    // Push query part for `limit` and return self
    this.pts.push ({ type: "limit", limitAmount: amt });
    return this;
  }

  /**
   * Skip the first specified amount of returned Model instances
   */
  skip (amt) {
    // Push query part for `skip` and return self
    this.pts.push ({ type: "skip", skipAmount: amt });
    return this;
  }

  /**
   * Sort returned Model instances by a key and optional direction (default descending)
   */
  sort (key, directionStr = "desc") {
    // Ensure directionStr is a String value
    directionStr = directionStr.toString ();

    // Create scoped variable for wether the order is descending or not
    let desc = null;

    // Parse directionStr into value to apply to `desc`
    if (directionStr === "1" || directionStr === "asc" || directionStr === "ascending") {
      // Sort by ascending
      desc = false;
    } else if (directionStr === "-1" || directionStr === "desc" || directionStr === "descending") {
      // Sort by descending
      desc = true;
    } else {
      // directionStr is unparseable, so throw error
      throw new Error ("Invalid sort value");
    }

    // Push query part for `sort` and return self
    this.pts.push ({ type: "sort", sortKey: key, desc: desc });
    return this;
  }

  /**
   * Filter only Model instances where the specified key matches the specified val, can also be given a filter object
   */
  where (key, value = null) {
    // If only argument is an Object, handle as a filter object
    if (key instanceof Object && value == null) {
      // Handle arg
      const filter = key;
      // Push query part for `filter` and return self
      this.pts.push ({ type: "filter", filter: filter });
      return this;
    }

    // Push query part for `whereEquals` and return self
    this.pts.push ({ type: "whereEquals", match: { prop: key, value: value } });
    return this;
  }

  /**
   * Only return Model instances where the value of the specified key is greater than the specified amount
   */
  gt (key, min) {
    // Push query part for `gt` and return self
    this.pts.push ({ type: "gt", min: min, key: key });
    return this;
  }

  /**
   * Only return model instances where the value of the specified key is less than the specified amount
   */
  lt (key, max) {
    // Push query part for `lt` and return self
    this.pts.push ({ type: "lt", max: max, key: key });
    return this;
  }

  /**
   * Only return Model instances where the value of the specified key is greater or equal to than the specified amount
   */
  gte (key, min) {
    // Push query part for `gte` and return self
    this.pts.push ({ type: "gte", min: min, key: key });
    return this;
  }

  /**
   * Only return model instances where the value of the specified key is less than or equal to the specified amount
   */
  lte (key, min) {
    // Push query part for `lte` and return self
    this.pts.push ({ type: "lte", max: max, key: key });
    return this;
  }

  /**
   * Finalize this query and return all matching Model instances
   */
  async find () {
    // Call internally stored DB API to return models matching self query
    return await this._db.findModels (this._Model, this);
  }

  /**
   * Finalize this query and return one matching Model instance
   */
  async findOne () {
    // Call internally stored DB API to return one model matching self query
    return await this._db.findModel (this._Model, this);
  }

  /**
   * Finalize this query and return the total amount of matching Model instances
   */
  async count () {
    // Call internally stored DB API to return the amount of models matching self query
    return await this._db.countModels (this._Model, this);
  }

  /**
   * Finalize this query and remove all matching Model instances
   */
  async remove () {
    // Call internally stored DB API to remove all models matching self query
    await this._db.removeModels (this._Model, this);
  }
}

// Exports
module.exports = exports = DbQuery;
