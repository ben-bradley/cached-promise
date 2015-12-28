'use strict';

import LRU from 'lru-cache';

export default class CachedPromise {
  constructor(options = {}) {
    let { load } = options;

    if (!load)
      throw new Error('You must provide a load function.');

    this._load = load;
    this._pending = new LRU();
    this._cache = new LRU(options);
  }

  get(data) {
    let { _cache, _load, _pending } = this,
      { key } = objectifyKey(data);

    return new Promise((resolve, reject) => {
      let value = _cache.get(key);

      if (value)
        return resolve(value);

      let pending = _pending.get(key) || [];

      pending.push({ resolve, reject });

      _pending.set(key, pending);

      if (pending.length === 1)
        return new Promise((res, rej) => _load(data, res, rej))
          .then((result) => {
            _cache.set(key, result);
            _pending.get(key).map((pending) => pending.resolve(result));
            _pending.del(key);
          })
          .catch((err) => {
            _pending.get(key).map((pending) => pending.reject(err));
            _pending.del(key);
          });
    });
  }

  set(data, value) {
    let { key } = objectifyKey(data);

    return new Promise((resolve, reject) => resolve(this._cache.set(key, value)));
  }

  peek(data) {
    let { key } = objectifyKey(data);

    return new Promise((resolve, reject) => resolve(this._cache.peek(key)));
  }

  del(data) {
    let { key } = objectifyKey(data);

    return new Promise((resolve, reject) => resolve(this._cache.del(key)));
  }

  reset() {
    return new Promise((resolve, reject) => resolve(this._cache.reset()));
  }

  has(data) {
    let { key } = objectifyKey(data);

    return new Promise((resolve, reject) => resolve(this._cache.has(key)));
  }

  keys() {
    return new Promise((resolve, reject) => resolve(this._cache.keys()));
  }

  values() {
    return new Promise((resolve, reject) => resolve(this._cache.values()));
  }

  length() {
    return new Promise((resolve, reject) => resolve(this._cache.length()));
  }

  itemCount() {
    return new Promise((resolve, reject) => resolve(this._cache.itemCount()));
  }

  dump() {
    return new Promise((resolve, reject) => resolve(this._cache.dump()));
  }

  load(ary) {
    return new Promise((resolve, reject) => resolve(this._cache.load(ary)));
  }

  prune() {
    return new Promise((resolve, reject) => resolve(this._cache.prune()));
  }

  forEach(callback) {
    return this._cache.forEach(callback);
  }

}


function objectifyKey(key) {
  if (typeof key === 'string')
    return { key };
  else if (key && key.key)
    return key;
  throw new Error('Key must be either a string or an object with a "key" property.');
}
