(function () {
        'use strict';

    var app = angular.module('app', [
        'ui.router',
        'user',
        'ui.bootstrap',
        'ui.checkbox',
        'srph.age-filter'
    ]);

    ///Router configuration
    var routes = function ($urlRouterProvider, $stateProvider) {
        var list = {
            name: 'users',
            url: '/users',
            templateUrl: 'user/list.html',
            controller: 'userListController',
            resolve: {
                users: ['userService', function (userService) {
                    return userService.getUsers();
                }]
            }
        };

        var edit = {
            name: 'usersEdit',
            url: '/users/{id}',
            templateUrl: 'user/edit.html',
            controller: 'userEditController',
            resolve: {
                user: ['$stateParams', 'userService', function ($stateParams, userService) {
                    return userService.getUserById($stateParams.id);
                }]
            }
        };

        $stateProvider.state(list);
        $stateProvider.state(edit);

        $urlRouterProvider.otherwise('users');
    };

    app.config(['$urlRouterProvider', '$stateProvider', routes]);

    //Custom directives
    app.directive('noclick', [function () {
        return {
            restrict: 'A',
            link: function link(scope, element) {
                element.bind('click', function (e) {
                    e.stopPropagation();
                });
            }
        };
    }]);
}());