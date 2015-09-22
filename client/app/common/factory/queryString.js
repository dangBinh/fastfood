angular.module('dLiteMe')
  .factory('queryString', function() {
  return function(query) {
    return '?' + Object.keys(query).map(function(key) {
      return encodeURI(key) + '=' + encodeURI(query[key]);
    }).join('&');
  }
});
