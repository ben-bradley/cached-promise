var q = require('q'),
  LRU = require('lru-cache');

// Use native promises where possible
var Promise = (Promise) ? Promise : q.Promise;

/**
 * Class for Cached-Promise
 * @param   {Object}        options LRU options plus .load
 * @returns {CachedPromise} Returns the Cached Promise instance
 */
function CachedPromise(options) {
  if (!this instanceof CachedPromise)
    return new CachedPromise(options);

  if (!options.load || typeof options.load !== 'function')
    throw new Error('Must provide a load function in options');

  this._load = options.load;
  this._cache = new LRU(options);
  return this;
}

/**
 * Internal fn to ensure that keys are properly converted to objects
 * @param   {Mixed}  key Must be a string or an object with a "key" property
 * @returns {Object} Returns a key object
 */
function objectifyKey(key) {
  if (typeof key === 'string')
    return {
      key: key
    }
  else if (!key.key)
    throw new Error('Key must be either a string or an object with a "key" property.');
  return key;
}

/**
 * Promise-wrapped LRU .get
 * If the key doesn't exist, CachedPromise will attempt to .load and return it.
 * @param   {String}  key The key for the cache item
 * @returns {Promise} Returns a promise for the cache item
 */
CachedPromise.prototype.get = function (key) {
  var cache = this._cache,
    load = this._load;
  key = objectifyKey(key);
  return Promise(function(resolve, reject) {
    var item = cache.get(key.key);
    if (item)
      return resolve(item);

    Promise(function(res, rej) {
      return load(key, res, rej)
    })
      .catch(reject)
      .done(function(item) {
        cache.set(key.key, item);
        resolve(item);
      });
  });
}

/**
 * Promise-wrapped LRU .set
 * This method allows for manually caching an item, otherwise .get will call .load
 * @param   {String}  key  The key to use to refer to the item
 * @param   {Mixed}   item The value to store in the cache
 * @returns {Promise} Returns a promise
 */
CachedPromise.prototype.set = function (key, item) {
  var cache = this._cache;
  key = objectifyKey(key);
  return Promise(function(resolve, reject) {
    cache.set(key.key, item);
    resolve();
  });
}

/**
 * Promise-wrapped LRU .peek
 * @param   {String}  key The key to use to peek at the item
 * @returns {Promise} Returns a promise
 */
CachedPromise.prototype.peek = function (key) {
  var cache = this._cache;
  key = objectifyKey(key);
  return Promise(function(resolve, reject) {
    resolve(cache.peek(key.key));
  });
}

/**
 * Promise-wrapped LRU .del
 * @param   {String}  key The key to delete
 * @returns {Promise} Returns a promise
 */
CachedPromise.prototype.del = function (key) {
  var cache = this._cache;
  key = objectifyKey(key);
  return Promise(function(resolve, reject) {
    cache.del(key.key);
    resolve();
  });
}

/**
 * Promise-wrapped LRU .reset
 * @returns {Promise} Returns a promise
 */
CachedPromise.prototype.reset = function () {
  var cache = this._cache;
  return Promise(function(resolve, reject) {
    cache.reset();
    resolve();
  });
}

/**
 * Promise-wrapped LRU .has
 * @param   {String}  key The key to validate in the cache
 * @returns {Promise} Returns a promise for the presence of the key
 */
CachedPromise.prototype.has = function (key) {
  var cache = this._cache;
  key = objectifyKey(key);
  return Promise(function(resolve, reject) {
    resolve(cache.has(key.key));
  });
}

/**
 * Promise-wrapped LRU .keys
 * @returns {Promise} Returns a promise for the list of keys
 */
CachedPromise.prototype.keys = function () {
  var cache = this._cache;
  return Promise(function(resolve, reject) {
    resolve(cache.keys());
  });
}

/**
 * Promise-wrapped LRU .values
 * @returns {Promise} Returns a promise for the list of values
 */
CachedPromise.prototype.values = function () {
  var cache = this._cache;
  return Promise(function(resolve, reject) {
    resolve(cache.values());
  });
}


module.exports = CachedPromise;
