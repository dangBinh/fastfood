angular.module('dLiteMe')
  .filter('reduceString', ['$filter', function ($filter) {
    return function (input, max) {
      if(!input) return '';

      max = parseInt(max, 10);
      if(!max) return input;
      if(input.length <= max) return input;
      input = input.substr(0, max);


      return $filter('limitTo')(input, max) + '...';
    }
  }]);
