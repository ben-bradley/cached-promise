'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var CachedPromise = (function () {
  function CachedPromise() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, CachedPromise);

    var load = options.load;

    if (!load) throw new Error('You must provide a load function.');

    this._load = load;
    this._pending = new _lruCache2['default']();
    this._cache = new _lruCache2['default'](options);
  }

  _createClass(CachedPromise, [{
    key: 'get',
    value: function get(data) {
      var _cache = this._cache;
      var _load = this._load;
      var _pending = this._pending;

      var _objectifyKey = objectifyKey(data);

      var key = _objectifyKey.key;

      return new Promise(function (resolve, reject) {
        var value = _cache.get(key);

        if (value) return resolve(value);

        var pending = _pending.get(key) || [];

        pending.push({ resolve: resolve, reject: reject });

        _pending.set(key, pending);

        if (pending.length === 1) return new Promise(function (res, rej) {
          return _load(data, res, rej);
        }).then(function (result) {
          _cache.set(key, result);
          _pending.get(key).map(function (pending) {
            return pending.resolve(result);
          });
          _pending.del(key);
        })['catch'](function (err) {
          _pending.get(key).map(function (pending) {
            return pending.reject(err);
          });
          _pending.del(key);
        });
      });
    }
  }, {
    key: 'set',
    value: function set(data, value) {
      var _this = this;

      var _objectifyKey2 = objectifyKey(data);

      var key = _objectifyKey2.key;

      return new Promise(function (resolve, reject) {
        return resolve(_this._cache.set(key, value));
      });
    }
  }, {
    key: 'peek',
    value: function peek(data) {
      var _this2 = this;

      var _objectifyKey3 = objectifyKey(data);

      var key = _objectifyKey3.key;

      return new Promise(function (resolve, reject) {
        return resolve(_this2._cache.peek(key));
      });
    }
  }, {
    key: 'del',
    value: function del(data) {
      var _this3 = this;

      var _objectifyKey4 = objectifyKey(data);

      var key = _objectifyKey4.key;

      return new Promise(function (resolve, reject) {
        return resolve(_this3._cache.del(key));
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this4._cache.reset());
      });
    }
  }, {
    key: 'has',
    value: function has(data) {
      var _this5 = this;

      var _objectifyKey5 = objectifyKey(data);

      var key = _objectifyKey5.key;

      return new Promise(function (resolve, reject) {
        return resolve(_this5._cache.has(key));
      });
    }
  }, {
    key: 'keys',
    value: function keys() {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this6._cache.keys());
      });
    }
  }, {
    key: 'values',
    value: function values() {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this7._cache.values());
      });
    }
  }, {
    key: 'length',
    value: function length() {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this8._cache.length());
      });
    }
  }, {
    key: 'itemCount',
    value: function itemCount() {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this9._cache.itemCount());
      });
    }
  }, {
    key: 'dump',
    value: function dump() {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this10._cache.dump());
      });
    }
  }, {
    key: 'load',
    value: function load(ary) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this11._cache.load(ary));
      });
    }
  }, {
    key: 'prune',
    value: function prune() {
      var _this12 = this;

      return new Promise(function (resolve, reject) {
        return resolve(_this12._cache.prune());
      });
    }
  }, {
    key: 'forEach',
    value: function forEach(callback) {
      return this._cache.forEach(callback);
    }
  }]);

  return CachedPromise;
})();

exports['default'] = CachedPromise;

function objectifyKey(key) {
  if (typeof key === 'string') return { key: key };else if (key && key.key) return key;
  throw new Error('Key must be either a string or an object with a "key" property.');
}
module.exports = exports['default'];