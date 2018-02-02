'use strict'

// Require dependencies
const DotProp = require ('dot-prop');

// Require local dependencies
const DbQuery = require ('./query');

/**
 * Extendable Model class
 */
class DbModel {
  /**
   * Construct Model class
   */
  constructor (data = {}, id = null) {
    // Set internal data from provided argument
    this.__data = data;

    // Set internal ID from provided argument
    this.__id = id;

    // Bind public methods to self
    this.get        = this.get.bind (this);
    this.set       = this.set.bind (this);
    this.unset     = this.unset.bind (this);
    this.increment = this.increment.bind (this);
    this.decrement = this.decrement.bind (this);
    this.save      = this.save.bind (this);
    this.remove    = this.remove.bind (this);
    this.refresh   = this.refresh.bind (this);
  }

  /**
   * Model prop of methods for getting raw plug-specific components
   */
  static get raw () {
    // return raw
    return {
      'db'     : async (...args) => await this.__db.getRawDb (...args),
      'table'  : async (...args) => await this.__db.getRawTable (...args),
      'cursor' : async (...args) => await this.__db.getRawCursor (...args),
    };
  }

  /**
   * Model instance prop of methods for getting raw plug-specific components
   */
  get raw () {
    // return raw constructor
    return this.constructor.raw;
  }

  /**
   * Get internal data by dot-prop key
   */
  get (key = '') {
    // Return full internal data if key not provided
    if (key.length === 0) {
      return Object.assign({}, this.__data);
    }

    // Return database ID of Model instance
    if (key === "_id") {
      return this.__id;
    }

    // Return stored value selected by dot-prop key
    return DotProp.get (this.__data, key);
  }

  /**
   * Set internal data by dot-prop key and value, or object containing update information
   */
  set (key, value = null) {
    // If only argument is an Object, merge Object with internal data
    if (key instanceof Object && value == null) {
      const updateObj = key;
      Object.assign (this.__data, updateObj);
      return;
    }

    // Set internal value selected by dot-prop key
    DotProp.set (this.__data, key, value);
  }

  /**
   * Un-set internal data by dot-prop key, array if dot-prop keys, or no argument to remove all data
   */
  unset (key = null) {
    // If only argument is an Array, iterate it as array of keys to remove
    if (key instanceof Array) {
      const keys = key;

      for (const key of keys) {
        // Delete prop by key
        DotProp.delete (this.__data, key);
      }

      return;
    }

    // Delete all internal data if provided key is not defined
    if (key == null) {
      // Redefine internal data object
      this.__data = {};

      return;
    }

    // Delete prop by key
    DotProp.delete (this.__data, key);
  }

  /**
   * Increment fields in internal data by dot-prop key and optional amount
   */
  increment (key, amt = 1) {
    // TODO: Support incrementing multiple using an object

    // Get current value of prop selected by dot-prop key
    const currValue = DotProp.get (this.__data, key);
    // Set value of prop selected by dot-prop key to be plus the increment amount (default 1)
    DotProp.set (this.__data, key, currValue + amt);
  }

  /**
   * Decrement fields in internal data by dot-prop key and optional amount
   */
  decrement (key, amt = 1) {
    // TODO: Support decrementing multiple using an object

    // Get current value of prop selected by dot-prop key
    const currValue = DotProp.get (this.__data, key);
    // Set value of prop selected by dot-prop key to be minus the increment amount (default 1)
    DotProp.set (this.__data, key, currValue - amt);
  }

  /**
   * Save this Model instance's data to the database
   */
  async save () {
    // Call internal DB API to save this Model instance
    const id = await this.constructor.__db.save (this, this.__id);

    if (id != null) {
      this.__id = id;
    }
  }

  /**
   * Remove this Model instance's data from the database
   */
  async remove () {
    // TODO: Should delete class itself too?

    // Throw error if not stored in database
    if (this.__id == null) {
      throw new Error ('Model not stored in database');
    }

    // Nullify internal ID as no longer exists in database
    this.__id = null;

    // Call internal DB API to remove the data associated with this Model instance by ID
    await this.constructor.__db.removeById (this.constructor, this.__id);
  }

  /**
   * Refresh this Model instance's internal data by re-fetching from the database
   */
   async refresh () {
     // Throw error if this Model instance is not stored in the database
     if (this.__id == null) {
       throw new Error ("Model not stored in database");
     }

     // Replace this Model instance's internal data with fetched data from the database
     this.__data = await this.constructor.__db.findDataById (this.constructor, this.__id)
   }

  /**
   * Create database query builder from self and associated DB API
   */
  static __query () {
    // Return a newly constructed DbQuery given `this` and internal DB API
    return new DbQuery (this, this.__db);
  }

  /**
   * Find model by ID
   */
  static async findById (id) {
    return await this.__db.findById (this, id);
  }

  /**
   * Query-less database actions using simple filter
   */
  // Find Model instances by simple filter
  static async find (filter = {}) { return await this.__query ().where (filter).find () }
  // Find single Model instance by simple filter
  static async findOne (filter = {}) { return await this.__query ().where (filter).findOne () }
  // Count stored Model instances by simple filter
  static async count (filter = {}) { return await this.__query ().where (filter).count () }
  // Sum stored Model instance values by simple filter
  static async sum (key, filter = {}) { return await this.__query ().where (filter).sum () }
  // Remove stored Model instance by simple filter
  static async remove (filter = {}) { return await this.__query ().where (filter).remove () }

  /**
   * Query constructor methods
   */
  // Create a query builder with initial `limit` set
  static limit (amt) { return this.__query ().limit (amt) }
  // Create a query builder with initial `skip` set
  static skip (amt) { return this.__query ().skip (amt) }
  // Create a query builder with initial `sort` set
  static sort (key, direction) { return this.__query ().sort (key, direction) }
  // Create a query builder with initial `where` set
  static where (key, value) { return this.__query ().where (key, value) }
  // Create a query builder with initial `gt` set
  static gt (key, min) { return this.__query ().gt (key, min) }
  // Create a query builder with initial `lt` set
  static lt (key, max) { return this.__query ().lt (key, max) }
  // Create a query builder with initial `gte` set
  static gte (key, min) { return this.__query ().gte (key, min) }
  // Create a query builder with initial `gt` set
  static lte (key, max) { return this.__query ().gt (key, max) }
}

// Exports
module.exports = exports = DbModel;
