// Angular queue for $http
// @ Copyright 2016 Luis Lobo Borobia
// MIT license
(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['angular'], factory);
  } else if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    // CommonJS support (for us webpack/browserify/ComponentJS folks)
    module.exports = factory(require('angular'));
  } else {
    // in the case of no module loading system
    // then don't worry about creating a global
    // variable like you would in normal UMD.
    // It's not really helpful... Just call your factory
    return factory(root.angular);
  }
}(this, function (angular) {
  'use strict';

  var moduleName = 'angularQueueHttp';
  var mod = angular.module(moduleName, ['angular-md5']);
  mod.value('angularQueueHttpOptions', {enabled: true});

  mod.factory('queueRequest', ['$http', '$q', 'md5', function ($http, $q, md5) {
    // array that works as a list of pending requests
    var queue = [];
    return function (req) {

      // hash the request parameters
      var reqHash = md5.createHash(req.stringify());

      var deferred = $q.defer();

      if (!queue[reqHash]) {

        queue[reqHash] = {
          getRequest: req,
          promises: [deferred]
        };

        $http(req)
          .then(function successCallback(response) {
            queue[reqHash].promises.forEach(function (deferred) {
              deferred.resolve(response);
            });
            delete queue[reqHash];
          }, function errorCallback(response) {
            queue[reqHash].promises.forEach(function (deferred) {
              deferred.reject(response);
            });
            delete queue[reqHash];
          });
      } else {
        queue[reqHash].promises.push(deferred);
      }

      return deferred.promise;
    }
  }]);

  return moduleName;
}));
