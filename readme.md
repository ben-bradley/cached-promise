# Cached Promise [![Build Status](https://secure.travis-ci.org/ben-bradley/cached-promise.png)](http://travis-ci.org/ben-bradley/cached-promise)

[![NPM](https://nodei.co/npm/cached-promise.png?downloads=true)](https://nodei.co/npm/cached-promise/)

> Take LRU-cache, add a little Promises, stir vigorously, let simmer, enjoy!

## Install

```
npm install cached-promise
```

## Use

```javascript
var CachedPromise = require('cached-promise');

var people = new CachedPromise({
  maxAge: 1000 * 2,
  load: function (data, resolve, reject) {
    process.nextTick(function () { // simulated async call
      resolve({
        datetime: new Date().getTime(),
        key: data.key // <- "bob"
      });
    });
  }
});

setInterval(function () {

  people.get('bob')
    .catch(function (err) {
      throw new Error(err);
    })
    .done(function (result) {
      console.log(result);
    });

}, 900);

```

### Keys as objects

I found that I often needed to have other bits of data available in my `load()` function besides just the `key` so I modified the API to be able to handle objects as the key.

```javascript
var CachedPromise = require('cached-promise');

var people = new CachedPromise({
  maxAge: 1000 * 2,
  load: function (data, resolve, reject) {
    process.nextTick(function () { // simulated async call
      resolve({
        datetime: new Date().getTime(),
        key: data.key, // <- "bob"
        email: data.email // <- "bob@example.com"
      });
    });
  }
});
setTimeout(function() {

  people.get({
    key: 'bob',
    email: 'bob@example.com'
  })
    .catch(function(err) {
      throw new Error(err);
    })
    .done(function(result) {

    })

}, 1000);
```

## `new CachedPromise(options)`

Cached Promise relies on LRU cache to do the heavy lifting for caching.  As such, the `options` are passed through with one exception:

### `load(key, resolve, reject)`

The `load` option is the async call that you want to make that produces the value to cache.  You can still manually `.set(key, value)` items in the cache, but the `load()` call will auto-populate/refresh the cache.

Say, for example, that you wanted to make a RESTful API call and cache the result for 30 seconds:

```javascript
var CachedPromise = require('cached-promise'),
    request = require('request');

var users = new CachedPromise({
  maxAge: 1000 * 30,
  load: function (key, resolve, reject) {
    request({
      method: 'get',
      url: 'http://localhost:8080/api/users/' + key,
      json: true
    }, function(err, res, json) {
      if (err)
        return reject(err);
      resolve(json);
    });
  }
});

setInterval(function () {

  users.get('bob')
    .catch(function (err) {
      throw new Error(err);
    })
    .done(function (result) {
      console.log(result);
    });

}, 1000);
```

In this example, the first time you call `users.get('bob')`, Cached Promise will execute `load()` and return the result when the request is complete.

The value will then be cached for 30 seconds and subsequent calls to `users.get('bob')` will hit the cache instead of making a call to the RESTful API.

### `cache.set(key, value)`

Cached Promise also allows you to manually set cache items just like you can with LRU cache, it just wraps the standard LRU `.set(key, value)` method with a promise.

### Other LRU methods

Cached Promise wraps all other LRU methods with a simple promise to keep things uniform.

#### LRU `.forEach()`

This one is NOT promise-wrapper.  If you call `cache.forEach()` it will be passed through directly to the LRU `forEach()` method.

```javascript
// example taken from the tests
//
var item = {
  datetime: new Date()
};

cache.set('foo', item) // manually create the item
  .catch(done)
  .done(function (values) {
    myCache.forEach(function(value, key, cache) {
      (value.datetime).should.equal(item.datetime);
      (key).should.equal('foo');
      (cache).should.be.an.instanceof(LRU);
    });
    done();
  });
```

## Test

```
npm test
```

## Versions

- 1.0.0 Refactored to ES6 and introduced pending handler
  - Pending handler will hold all `load()` calls for the same key until the first one is resolved.
- 0.1.1 Added feature to allow using objects with key property as the key
- 0.0.1 Initial version
