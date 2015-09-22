angular.module('dLiteMe').controller('CarouselCrtl',
  function ($scope) {
    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    var slides = $scope.slides = [
      [
        {
            imageSrc: '../assets/images/kfc.png',
            imageAlt: 'KFC Fast Food',
            areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
          }, {
            imageSrc: '../assets/images/mc.png',
            imageAlt: 'McDonalds Image',
            areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        },
        {
            imageSrc: '../assets/images/bk.png',
            imageAlt: 'Burger King Food',
            areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        }
      ], [
        {
          imageSrc: '../assets/images/kfc.png',
          imageAlt: 'KFC Fast Food',
          areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        }, {
          imageSrc: '../assets/images/bk.png',
          imageAlt: 'Burger King Food',
          areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        }, {
          imageSrc: '../assets/images/mc.png',
          imageAlt: 'McDonalds Image',
          areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        },
      ], [
        {
          imageSrc: '../assets/images/mc.png',
          imageAlt: 'McDonalds Image',
          areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        },{
          imageSrc: '../assets/images/kfc.png',
          imageAlt: 'KFC Fast Food',
          areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        },
        {
          imageSrc: '../assets/images/bk.png',
          imageAlt: 'Burger King Food',
          areas: ['London SE4', 'Commercial Rd PO4', 'E2', 'SE1', 'Copnor Rd PO2']
        }
      ]
    ]

    console.log(slides);

    $scope.setActive = function (position) {
      $scope.slides(position).active = true;
    }
  }

);
