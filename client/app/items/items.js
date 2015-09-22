'use strict';

angular.module('dLiteMe')
  .config(function ($stateProvider) {
    $stateProvider
      .state('items', {
        url: '/items',
        templateUrl: '../items/items.html',
        controller: 'ItemsCtrl'
      });
  });
