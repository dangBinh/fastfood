'use strict';

angular.module('dLiteMe', [
  'ngCookies',
  'ngDialog',
  'ngResource',
  'ngSanitize',
  'ngCookies',
  'ui.select',
  'btford.socket-io',
  'ui.router',
  'ngAnimate',
  'ui.bootstrap',
  'angular-flexslider', /* Flex slider for Home page - takeaways orders */
  'slick'
])

.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.hashPrefix('!');

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'MainCtrl'
      })
      .state('merchants', {
        url: '/merchants',
        template: '<div ui-view=""></div>'
      })
      .state('merchants.search', {
        url: '/search/:postcode',
        templateUrl: 'app/merchants/merchants.html',
        controller: 'MerchantsCtrl'
      })
      .state('merchants.menu', {
        url: '/menu-{merchantName}-{id}-{postcode}',
        templateUrl: 'app/merchants/menu.html',
        controller: 'MerchantsMenuCtrl'
      })
      .state('faq', {
        url: '/faq',
        templateUrl: 'app/faq/faq.html',
        controller: 'faqCtrl'
      })
      .state('how-it-works', {
        url: '/how-it-works',
        templateUrl: 'app/how-it-works/howItWorks.html',
        controller: 'howItWorksCtrl'
      })
      .state('what-we-do', {
        url: '/what-we-do',
        templateUrl: 'app/what-we-do/whatWeDo.html',
        controller: 'whatWeDoCtrl'
      })
      .state('my-profile', {
        url: '/my-profile',
        templateUrl: 'app/my-profile/myProfile.html',
        controller: 'myProfileCtrl'
      })
      .state('checkout', {
        url: '/checkout',
        templateUrl: 'app/checkout/checkout.html',
        controller: 'CheckoutCtrl'
      })
      .state('checkout.account', {
        url: '/account',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_account.html'
          }
        }
      })
      .state('checkout.info', {
        url: '/info',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_info.html'
          }
        }
      })
      .state('checkout.sending', {
        url: '/sending',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_sending.html'
          }
        }
      })
      .state('checkout.success', {
        url: '/success',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_success.html'
          }
        }
      })
      .state('checkout.fail', {
        url: '/fail',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_fail.html'
          }
        }
      })
      .state('checkout.accepted', {
        url: '/accepted',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_accepted.html'
          }
        }
      })
      .state('checkout.rejected', {
        url: '/rejected',
        views: {
          checkout: {
            templateUrl: 'app/checkout/checkout_rejected.html'
          }
        }
      });
    //  $httpProvider.interceptors.push('authInterceptor');
  })
  .run([
    '$location',
    '$timeout',
    '$state',
    '$stateParams',
    '$rootScope',
    'Modals',
    'postcodeService',

    // 'CacheService',
    function($state, $stateParams, $rootScope, $location, $modals) {

      $rootScope.modals = $modals;
    }
  ])


// .factory('authInterceptor', function($rootScope, $q, $cookieStore, $location) {
//  return {
//    // Add authorization token to headers
//    request: function(config) {
//      config.headers = config.headers || {};
//      if ($cookieStore.get('token')) {
//        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
//      }
//      return config;
//    },

//    // Intercept 401s and redirect you to login
//    responseError: function(response) {
//      if (response.status === 401) {
//        $location.path('/login');
//        // remove any stale tokens
//        $cookieStore.remove('token');
//        return $q.reject(response);
//      } else {
//        return $q.reject(response);
//      }
//    }
//  };
// })

// .run(function($rootScope, $location, Auth) {
//  // Redirect to login if route requires auth and you're not logged in
//  $rootScope.$on('$stateChangeStart', function(event, next) {
//    Auth.isLoggedInAsync(function(loggedIn) {
//      if (next.authenticate && !loggedIn) {
//        $location.path('/login');
//      }
//    });
//  });
// })
;
