(function (angular) {
  'use strict';
  angular
    .module('myServiceModule', [])
    .config(['$sceDelegateProvider',
      function ($sceDelegateProvider) {
        // var whiteList = [
        //   // Allow same origin resource loads.
        //   'self',
        //   // Allow loading from our assets domain.  Notice the difference between * and **.,
        //   'https://pc3-media.s3.amazonaws.com/**',
        //   'https://pc-prod.s3.amazonaws.com/**',
        //   'https://s3.amazonaws.com/**'
        // ];
        // if (pc3Env === 'development') {
        //   whiteList = ['**'];
        // }
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
      }
    ])
    .controller('MyController', ['$scope', '$window', 'queueRequest', function ($scope, $window, queueRequest) {
      $scope.queueRequest = function (url) {
        queueRequest({
          method: 'GET',
          url: url
        })
          .then(function successCallback(response) {
            $window.alert("OK" + response.data.length);
          }, function errorCallback(err) {
            console.log('error', err, JSON.stringify(err, Object.getOwnPropertyNames(err)));
            //$window.alert("ERROR" + response.stringify());
          });
      };
    }])
    .factory('queueRequest', ['$http', '$q', function ($http, $q) {
      var queue = [];
      return function (req) {

        var id = objectHash(req);

        var deferred = $q.defer();

        if (!queue[id]) {

          queue[id] = {
            getRequest: req,
            promises: [deferred]
          };

          $http(req)
            .then(function successCallback(response) {
              queue[id].promises.forEach(function (deferred) {
                deferred.resolve(response);
              });
              delete queue[id];
            }, function errorCallback(response) {
              queue[id].promises.forEach(function (deferred) {
                deferred.reject(response);
              });
              delete queue[id];
            });
        } else {
          queue[id].promises.push(deferred);
        }

        return deferred.promise;
      }
    }]);
})(window.angular);

/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */