var app = angular.module('dLiteMe');

app.filter('dateToIso', function () {
  console.log('here');
  return function (input) {
    input = new Date(input).toISOString;
    return input;
  }
});
