var CachedPromise = require('../');

var people = new CachedPromise({
  maxAge: 1000 * 2,
  load: function (key, resolve, reject) {
    process.nextTick(function () {
      resolve({
        datetime: new Date().getTime(),
        key: key
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
