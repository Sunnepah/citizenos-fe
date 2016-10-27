'use strict';

angular
    .module('citizenos')
    .service('sAuth', ['$http', '$q', '$log', function ($http, $q, $log) {
    sAuth = this;
    sAuth.user = {
        loggedIn: false,
        isLoading:true
    };
    var service = {
        login : login,
        status : status,
        user: this.user
    };

    return service;

    function login (email, password) {
        angular.extend(sAuth.user, { loggedIn: true, loadlang: false, isLoading: false, id: "2eedafda-2f7f-48e7-9220-d951218f0bc1", name: "Ilmar Tyrk", company: "CitizenOS", language: "et", email: "ilmar.tyrk@gmail.com", imageUrl: null });
    }

    function status (){
        return $q(function(resolve, reject) {
            setTimeout(function() {
            //    angular.extend(sAuth.user, { loggedIn: true, loadlang: false, isLoading: false, id: "2eedafda-2f7f-48e7-9220-d951218f0bc1", name: "Ilmar Tyrk", company: "CitizenOS", language: "et", email: "ilmar.tyrk@gmail.com", imageUrl: null });
                sAuth.user.isLoading = false;
                resolve(sAuth.user);
            }, 500);
          });
    }

}]);
