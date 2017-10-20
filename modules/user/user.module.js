(function () {
    'use strict';

    var userModule = angular.module('user', []);

    userModule.factory('userService', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        var users = [];
        return {
            getUsers: function () {
                var deferred = $q.defer();
                $http.get('/data/users.json').then(function (response) {
                    if (users.length < 1) {
                        users = response.data;
                    }
                    deferred.resolve(users);
                }, function (err) {
                    console.lor(err);
                });
                return deferred.promise;
            },
            getUserById: function (userId) {
                var deferred = $q.defer();
                var get = function () {
                    var user = users.filter(function (user, index) { return user.id == userId })[0];
                    deferred.resolve(user);
                };
                $timeout(function () {
                    if (users.length < 1) {
                        this.getUsers().then(get());
                    }
                    else {
                        get();
                    }
                }, 1000);
                return deferred.promise;
            },
            editUser: function (user) {
                var deferred = $q.defer();
                $timeout(function () {
                    for (var i in users)
                    {
                        if (users[i].id == user.id) {
                            users[i] = user;
                        }
                    }
                    deferred.resolve();
                }, 1000);
                return deferred.promise;
            },
            deleteListUser: function (userIds) {
                var deferred = $q.defer();
                $timeout(function () {
                    var indexes = [];
                    for (var i in userIds) {
                        var index = users.map(function (u) { return u.id; }).indexOf(userIds[i]);
                        users.splice(index, 1);
                    };
                }, 10);
            },
            deleteUser: function (userId) {
                var deferred = $q.defer();
                $timeout(function () {
                    var index = users.map(function (u) { return u.id; }).indexOf(userId);
                    users.splice(index, 1);
                    deferred.resolve();
                }, 10);
                return deferred.promise;
            }
        };
    }]);

    userModule.controller('userListController', ['$scope', 'users', '$uibModal', 'userService', function ($scope, users, $uibModal, userService) {
        var _begin = 0;
        var _end = $scope.numPerPage;

        $scope.pagedUsers = function () {
            return $scope.users.slice(_begin, _end);
        };

        $scope.currentPage = 1;

        $scope.numPerPage = 10;

        $scope.maxSize = 5;

        $scope.$watch("currentPage + numPerPage", function () {
            _begin = (($scope.currentPage - 1) * $scope.numPerPage);
            _end = _begin + $scope.numPerPage;
        });

        $scope.users = users;

        $scope.countSelected = function () {
            return $scope.users.filter(function (user, index) { return user.selected; }).length;
        };

        $scope.allSelected;

        $scope.toggleAll = function () {
            $scope.users.forEach(function (user, index) { user.selected = !$scope.allSelected; });
        };

        $scope.downloadCSV = function () {
            if ($scope.users.length > 0) {
                var csvName = "users.csv";
                var csvMIME = "text/csv";
                var csvFile = "";
                var csvHeader = "";
                $scope.users.forEach(function (user, index) {
                    if (user.selected) {
                        for (var prop in user) {
                            if (index === 0) {
                                csvHeader += prop + ";";
                            }
                            csvFile += escapeCSV(user[prop]) + ";";
                        }
                        csvFile = csvFile.replace(/;$/g, "\n");
                    }
                });
                csvFile = csvHeader.replace(/;$/g, "\n") + csvFile;
                contentDisposition(csvFile, csvName, csvMIME);
            }
        };

        $scope.deleteAllSelected = function () {
            var users = $scope.users.filter(function (user) {
                return user.selected;
            });
            userService.deleteListUser(users.map(function (u) { return u.id; }));
        };

        $scope.delete = function (user, index) {
            userService.deleteUser(user.id);
        };

        $scope.modalOpen = function (selectedUser) {
            var modalInstance = $uibModal.open({
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'userDetail.html',
                controller: ['$uibModalInstance', '$scope', 'selectedUser', function ($uibModalInstance, $scope, selectedUser) {
                    $scope.modalOK = function () {
                        $uibModalInstance.close();
                    };

                    $scope.modalCancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    $scope.selectedUser = selectedUser;
                }],
                resolve: {
                    selectedUser: function () {
                        return selectedUser;
                    }
                }
            });
        };

        var escapeCSV = function (text) {
            return text.toString().replace(";", "';'");
        };

        var contentDisposition = function (file, fileName, MIMEType) {
            var a = document.createElement('a');
            MIMEType = MIMEType || 'application/octet-stream';
            if (navigator.msSaveBlob) { // IE10
                return navigator.msSaveBlob(new Blob([file], { type: MIMEType }), fileName);
            }
            else if ('download' in a) { //html5 A[download]
                a.href = 'data:' + MIMEType + ',' + encodeURIComponent(file);
                a.setAttribute('download', fileName);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return true;
            }
            else { //do iframe dataURL download (old ch+FF):
                var f = document.createElement('iframe');
                document.body.appendChild(f);
                f.src = 'data:' + MIMEType + ',' + encodeURIComponent(file);
                setTimeout(function () {
                    document.body.removeChild(f);
                }, 300);
                return true;
            }
        };
    }]);

    userModule.controller('userEditController', ['$filter', '$scope', '$state', '$uibModal', 'userService', 'user', function ($filter, $scope, $state, $uibModal, userService, user) {
        if (user != null) {
            user.dateOfBirth = new Date(user.dateOfBirth);
        };
        $scope.user = angular.copy(user);

        $scope.confirm = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'confirmModal.html',
                controller: ['$uibModalInstance', '$scope', function ($uibModalInstance, $scope) {
                    $scope.reset = function (response) {
                        if (response == '1') {
                            $uibModalInstance.close();
                            $state.go('users');
                        } else {
                            $uibModalInstance.dismiss('cancel');
                        }
                    };
                }]
            });
        };

        $scope.save = function (user) {
            userService.editUser(user).then(function () {
                $state.go('users');
            });
        }
    }]);
}());