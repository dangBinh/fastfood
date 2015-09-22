'use strict';

angular.module('dLiteMe').controller('MainCtrl',

	function($stateParams, $state, $scope, socket, postcodeService, orderService, $timeout) {
		$scope.awesomeThings = [];
		$scope.orderList = {
			orderInfo: []
		};


		function _init() {
			fetchOrders();
		}
		// Postcode session on home page
		$scope.postcode = {
			// Validate postcode
			check: function() {
				return {
					'errorMessage': 'Invalid postcode',
					'valid': postcodeService.checkPostCode($scope.postcode.value)
				}
			},

			// Search function
			search: function() {
				$scope.postcode.showvalid = $scope.postcode.check();
				if ($scope.postcode.showvalid.valid) {
					var postcode = postcodeService.formatPostcode($scope.postcode.value);
					$state.go('merchants.search', {
						postcode: postcode
					});
				}
			},
			'valid': false,
			'value': ''
		};



		// Trending section
		$scope.trending = {
			'title': 'Trending Dishes Delivered',
			'description': "At DLites, we delights our customers by delivering local trendy dishes from restaurants you already know and loved and deliver within 45 minutes. Join us and get 10% off your first delivery.",
			'cta': 'Get Started'
		};


		// Takeaways section (with flex-slider)
		$scope.takeaways = {
			'title': 'Takeaways & Outlets added today',
			'groups': [{
				'list': [{
					'name': 'KFC ',
					'code': 'London SE4',
					'img': '../assets/images/mc.jpg'

				}, {
					'name': 'Ocean Swell - Fish & Chips',
					'code': 'Copnor Rd PO2'
				}, {
					'name': 'McDonalds ',
					'code': 'W6'
				}, {
					'name': 'Burger King ',
					'code': 'SE8'
				}, {
					'name': 'KFC ',
					'code': 'E2'
				}, {
					'name': 'McDonalds ',
					'code': 'E1W'
				}, {
					'name': 'Burger King ',
					'code': 'E4'
				}, {
					'name': 'Bay Water - Chinese',
					'code': 'W1'
				}, {
					'name': 'McDonalds ',
					'code': 'EC2'
				}, {
					'name': 'Burger King ',
					'code': 'E1'
				}]
			}, {
				'list': [{
					'name': 'McDonalds ',
					'code': 'N12'
				}, {
					'name': 'KFC ',
					'code': 'Commercial Rd PO4'
				}, {
					'name': 'Ocean Swell - Fish & Chips',
					'code': 'Copnor Rd PO2'
				}, {
					'name': 'McDonalds ',
					'code': 'N1'
				}, {
					'name': 'Burger King ',
					'code': 'Commercial Rd PO4'
				}, {
					'name': 'McDonalds ',
					'code': 'SW8'
				}, {
					'name': 'H & D Fish and Chips',
					'code': 'Portsmouth Rd'
				}, {
					'name': 'KFC ',
					'code': 'Fratton PO4'
				}, {
					'name': 'Alpha Amazing',
					'code': 'North End'
				}]
			}, {
				'list': [{
					'name': 'KFC ',
					'code': 'Copnor Rd PO2'
				}, {
					'name': 'McDonalds ',
					'code': 'SE28'
				}, {
					'name': 'KFC ',
					'code': 'SE1'
				}, {
					'name': 'McDonalds ',
					'code': 'E1W'
				}, {
					'name': 'Burger King ',
					'code': 'EC1'
				}, {
					'name': 'McDonalds ',
					'code': 'EC2'
				}, {
					'name': 'Burger King ',
					'code': 'N12'
				}]
			}]
		};

		// Restaurants section (with owl carousel)
		$scope.restaurants = {
			'options': {
				'navigation': true,
				'pagination': true,
				'rewindNav': true
			},
			'data': [{
				'imageSrc': '../assets/data/res-01.png',
				'imageAlt': 'fast food image'
			}, {
				'imageSrc': '../assets/data/res-02.png',
				'imageAlt': 'fast food image'
			}, {
				'imageSrc': '../assets/data/res-03.png',
				'imageAlt': 'fast food image'
			}, {
				'imageSrc': '../assets/data/res-04.png',
				'imageAlt': 'fast food image'
			}, {
				'imageSrc': '../assets/data/res-05.png',
				'imageAlt': 'fast food image'
			}, {
				'imageSrc': '../assets/data/res-03.png',
				'imageAlt': 'fast food image'
			}, {
				'imageSrc': '../assets/data/res-02.png',
				'imageAlt': 'fast food image'
			}]
		};

		function fetchOrders() {
			var options = {

				query: {

					orderStatus: '0',
					limitTo: 10

				}
			};

    // Fetch data using promise

      orderService.getFewData(options).then( function (response) {
        if(response.status === 'success') {
          $scope.orders = response.data;
          for (var i = 0; i < $scope.orders.length; i++) {
            angular.forEach($scope.orders, function(item) {
              item.childrenList = [];
              angular.forEach( JSON.parse( item.orderDetails ), function (value) {
                item.childrenList.push(value);

              });
            });
          }
          socket.syncUpdates('orders', $scope.orders);
        }
      })

		}


		/**
		 *
		 */

		$scope.$on('$destroy', function() {
			socket.unsyncUpdates('orders');
		});

		return $timeout(_init);
	});


