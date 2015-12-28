var should = require('should'),
  LRU = require('lru-cache');
  CachedPromise = require('../');

describe('CachedPromise', function () {

  var cache, item;

  beforeEach(function () {
    item = {
      datetime: new Date().getTime()
    };
    cache = new CachedPromise({
      maxAge: 1000, // 1 sec
      load: function (key, resolve, reject) {
        setTimeout(function () { // simulated async operation
          resolve({
            datetime: new Date().getTime(),
            key: key.key,
            value: key.value
          });
        }, 5);
      }
    });
  });

  it('should be requireable', function () {
    (CachedPromise).should.be.a.Function;
  });

  it('should return an instance', function () {
    (cache).should.be.an.instanceOf(CachedPromise);
  });

  describe('Methods', function () {

    describe('#get', function () {

      it('should exist', function () {
        (cache.get).should.exist;
      });

      it('should cache and return a value', function (done) {
        cache.get('foo')
          .then(function (value) {
            (value).should.be.an.Object.with.property('datetime');
            done();
          })
          .catch(done);
      });

      it('should cache a value and return it on a second request', function (done) {
        cache.get('foo')
          .catch(done)
          .then(function (value) {
            cache.get('foo')
              .then(function (value2) {
                (value2.datetime).should.equal(value.datetime);
                done();
              });
          })
          .catch(done);
      });

      it('should update the cache when requesting an expired key', function (done) {
        cache.get('foo')
          .then(function (value) {
            setTimeout(function () {
              cache.get('foo')
                .catch(done)
                .then(function (value2) {
                  (value2.datetime).should.not.equal(value.datetime);
                  done();
                });
            }, 1001);
          })
          .catch(done);
      });

      it('should allow for using an object with a key property as the key', function(done) {
        cache.get({
          key: 'foo',
          value: 'bar'
        })
          .then(function(value) {
            (value).should.be.an.Object.with.properties(['datetime', 'key', 'value']);
            (value.key).should.equal('foo');
            (value.value).should.equal('bar');
            done();
          })
          .catch(done);
      });

    }); // /#get

    describe('#set', function () {

      it('should exist', function () {
        (cache.set).should.exist;
      });

      it('should create an entry in the cache', function (done) {
        cache.set('foo', item)
          .then(function () {
            return cache.get('foo');
          })
          .then(function (value) {
            (value.datetime).should.equal(item.datetime);
            done();
          })
          .catch(done);
      });

    }); // /#set

    describe('#peek', function () {

      it('should exist', function () {
        (cache.peek).should.exist;
      });

      it('should return the value', function (done) {
        cache.set('foo', item)
          .then(function () {
            return cache.peek('foo');
          })
          .then(function (value) {
            (value).should.be.an.Object.with.property('datetime');
            done();
          })
          .catch(done);
      });

    }); // /#peek

    describe('#del', function () {

      it('should exist', function () {
        (cache.del).should.exist;
      });

      it('should delete a cache item', function (done) {
        cache.set('foo', item) // manually create the item
          .then(function () {
            return cache.del('foo'); // delete the item
          })
          .then(function () {
            return cache.get('foo'); // get/create the item
          })
          .then(function (value) {
            (value.datetime).should.not.equal(item.datetime);
            done();
          })
          .catch(done);
      });

    }); // /#del

    describe('#reset', function () {

      it('should exist', function () {
        (cache.reset).should.exist;
      });

      it('should reset the cache', function (done) {
        cache.set('foo', item) // manually create the item
          .then(function () {
            return cache.reset(); // reset the items
          })
          .then(function () {
            return cache.get('foo'); // get/create the item
          })
          .then(function (value) {
            (value.datetime).should.not.equal(item.datetime);
            done();
          })
          .catch(done);
      });

    }); // /#reset

    describe('#has', function () {

      it('should exist', function () {
        (cache.has).should.exist;
      });

      it('should validate if a key exists', function (done) {
        cache.get('foo') // create the item via .load
          .then(function () {
            return cache.has('foo');
          })
          .then(function (has) {
            (has).should.eql(true);
            return cache.has('bar');
          })
          .then(function (has) {
            (has).should.eql(false);
            done();
          })
          .catch(done);
      });

    }); // /#has

    describe('#keys', function() {

      it('should exist', function() {
        (cache.keys).should.exist;
      });

      it('should return an array of keys', function(done) {
        cache.get('foo') // create the item via .load
          .then(function () {
            return cache.keys();
          })
          .then(function (keys) {
            (keys).should.be.an.Array;
            (keys[0]).should.equal('foo');
            done();
          })
          .catch(done);
      });

    }); // /#keys

    describe('#values', function() {

      it('should exist', function() {
        (cache.values).should.exist;
      });

      it('should return an array of values', function(done) {
        cache.set('foo', item) // manually create the item
          .then(function () {
            return cache.values();
          })
          .then(function (values) {
            (values).should.be.an.Array;
            (values[0]).should.be.an.Object.with.property('datetime');
            (values[0].datetime).should.equal(item.datetime);
            done();
          })
          .catch(done);
      });

    }); // /#values

    describe('#forEach', function() {

      it('should exist', function() {
        (cache.forEach).should.exist;
      });

      it('should pass through to the LRU forEach', function(done) {
        cache.set('foo', item) // manually create the item
          .then(function (values) {
            // var _cache = {};
            cache.forEach(function(v, k, c) {
              (v.datetime).should.equal(item.datetime);
              (k).should.equal('foo');
              (c).should.be.an.instanceof(LRU);
            });
            done();
          })
          .catch(done);
      });

    }); // /#values

  }); // /Methods

}); // /CachedPromise
