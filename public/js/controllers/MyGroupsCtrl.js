'use strict';

angular
    .module('citizenos')
    .controller('MyGroupsCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$log', 'sAuth', 'Group', 'Topic', function ($rootScope, $scope, $state, $stateParams, $log, sAuth, Group, Topic) {
        $log.debug('MyGroupsCtrl', $stateParams);

        // All the Topic filters in the dropdown
        var filters = [
            {
                id: 'all',
                name: 'Show all my topics',
                onSelect: function () {
                    $scope.filters.selected = this;
                    Topic
                        .query().$promise
                        .then(function (topics) {
                            $log.debug('Topics loaded', topics);
                            //FIXME: Do something with the result!
                        });
                }
            },
            {
                name: 'Show only:',
                children: [
                    {
                        id: 'myPublic',
                        name: 'My public topics',
                        onSelect: function () {
                            $scope.filters.selected = this;
                            Topic
                                .query({visibility: Topic.VISIBILITY.public}).$promise
                                .then(function (topics) {
                                    $log.debug('Topics loaded', topics);
                                    //FIXME: Do something with the result!
                                });
                        }
                    },
                    {
                        id: 'myPrivate',
                        name: 'My private topics',
                        onSelect: function () {
                            $scope.filters.selected = this;
                            Topic
                                .query({visibility: Topic.VISIBILITY.private}).$promise
                                .then(function (topics) {
                                    $log.debug('Topics loaded', topics);
                                    //FIXME: Do something with the result!
                                });
                        }
                    },
                    {
                        id: 'iCreated',
                        name: 'Topics I created',
                        onSelect: function () {
                            $scope.filters.selected = this;
                            Topic
                                .query({creatorId: sAuth.user.id}).$promise
                                .then(function (topics) {
                                    $log.debug('Topics loaded', topics);
                                    //FIXME: Do something with the result!
                                });
                        }
                    }
                ]
            },
            {
                id: 'grouped',
                name: 'Show topics ordered by groups',
                onSelect: function () {
                    $scope.filters.selected = this;
                    Group
                        .query().$promise
                        .then(function (groups) {
                            // FIXME: Do something with the result!
                        });
                }
            }
        ];

        var filterParam = $stateParams.filter || filters[0].id;
        $scope.filters = {
            items: filters,
            selected: _.find(filters, {id: filterParam}) || _.chain(filters).map('children').flatten().find({id: filterParam}).value() || filters[0]
        };

        $scope.groupList = [];
        $scope.isGroupListLoading = true;

        Group
            .query().$promise
            .then(function (groups) {
                $scope.groupList = groups;
                $scope.isGroupListLoading = false;
                initGroupListView();
            }, function () {
                $log.log('MyGroupsCtrl', 'Group list fetch failed', res);
                $scope.isGroupListLoading = false;
            });

        var initGroupListView = function () {
            // Do not auto-navigate to first groups detail view in mobile
            if ($rootScope.wWidth > 750) { // TODO: When dev ends, define constants for different screen widths!
                if ($scope.groupList.length && !$stateParams.groupId) {
                    $state.go('mygroups.view', {groupId: $scope.groupList[0].id});
                }
            }
        };

        $scope.doToggleGroupTopicList = function (group) {
            if (group.isTopicListExpanded) {
                group.isTopicListExpanded = false;
            } else {
                if (!group.topics.rows) {
                    group
                        .getTopicList().$promise
                        .then(function () {
                            group.isTopicListExpanded = true;
                        });
                } else {
                    group.isTopicListExpanded = true;
                }
            }
        };

        // In case there is $state.go('mygroups') somewhere, we need to initialize the view so that for non-mobile we show first Groups detail view.
        $scope.$on('$stateChangeSuccess', function () {
            if ($state.is('mygroups')) {
                initGroupListView();
            }
        });

    }]);
