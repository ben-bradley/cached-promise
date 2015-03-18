var should = require('should'),
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
            datetime: new Date().getTime()
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
          .catch(done)
          .done(function (value) {
            (value).should.be.an.Object.with.property('datetime');
            done();
          });
      });

      it('should cache a value and return it on a second request', function (done) {
        cache.get('foo')
          .catch(done)
          .done(function (value) {
            cache.get('foo')
              .catch(done)
              .done(function (value2) {
                (value2.datetime).should.equal(value.datetime);
                done();
              });
          });
      });

      it('should update the cache when requesting an expired key', function (done) {
        cache.get('foo')
          .catch(done)
          .done(function (value) {
            setTimeout(function () {
              cache.get('foo')
                .catch(done)
                .done(function (value2) {
                  (value2.datetime).should.not.equal(value.datetime);
                  done();
                });
            }, 1001);
          });
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
          .catch(done)
          .done(function (value) {
            (value.datetime).should.equal(item.datetime);
            done();
          });
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
          .catch(done)
          .done(function (value) {
            (value).should.be.an.Object.with.property('datetime');
            done();
          });
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
          .catch(done)
          .done(function (value) {
            (value.datetime).should.not.equal(item.datetime);
            done();
          });
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
          .catch(done)
          .done(function (value) {
            (value.datetime).should.not.equal(item.datetime);
            done();
          });
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
          .catch(done)
          .done(function (has) {
            (has).should.eql(false);
            done();
          });
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
          .catch(done)
          .done(function (keys) {
            (keys).should.be.an.Array;
            (keys[0]).should.equal('foo');
            done();
          });
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
          .catch(done)
          .done(function (values) {
            (values).should.be.an.Array;
            (values[0]).should.be.an.Object.with.property('datetime');
            (values[0].datetime).should.equal(item.datetime);
            done();
          });
      });

    }); // /#values

  }); // /Methods

}); // /CachedPromise
