'use strict';

angular
    .module('citizenos')
    .controller('ActivitiesCtrl', [
        '$scope', '$stateParams', '$document', 'sActivity', function ($scope, $stateParams, $document, sActivity) {
        $scope.activitiesOffset = 0;
        $scope.activitiesLimit = 25;
        $scope.activities = [];
        $scope.filter = 'all';
        $scope.activityfilters = ['all', 'topics', 'groups', 'user', 'self'];
        var lastViewTime = null;

        $scope.loadActivities = function (offset, limit) {
            $scope.activitiesOffset = offset || $scope.activitiesOffset;
            if (offset === 0) {
                $scope.activitiesOffset = 0;
            }

            $scope.activitiesLimit = limit || $scope.activitiesLimit;
            if ($scope.activities.length && !offset && !limit) {
                $scope.activitiesOffset += $scope.activitiesLimit;
            }

            var filterValue = $scope.filter;
            if (filterValue === 'all') {
                filterValue = null;
            }

            sActivity
                .getActivities($scope.activitiesOffset, $scope.activitiesLimit, filterValue)
                .then(function (activities) {
                    activities.forEach(function (activity, key) {
                        if (activity.data.type === 'View' && activity.data.object && activity.data.object['@type'] === 'Activity') {
                            if (!lastViewTime || activity.updatedAt > lastViewTime) {
                                lastViewTime = activity.updatedAt;
                            }
                            activities.splice(key, 1);
                        } else if (!lastViewTime || activity.updatedAt > lastViewTime) {
                            activity.isNew = '-new';
                        }
                    });

                    $scope.showLoadMoreActivities = !(activities.length < $scope.activitiesLimit);
                    $scope.activities = $scope.activities.concat(activities);

                    var element = angular.element($document[0].getElementsByClassName('lightbox_content'));
                    if (element && element[0] && element[0].scrollHeight) {
                        $scope.$watch(element[0].scrollHeight, function () {
                            if (activities.length && element[0].clientHeight >= element[0].scrollHeight) {
                                $scope.loadActivities();
                            }
                        }, true);
                    }

                });
        };
        $scope.loadActivities();

        $scope.filterActivities = function (filter) {
            $scope.filter = filter;
            $scope.activities = [];
            $scope.loadActivities(0);
        };

        $scope.showActivityDescription = function (activity) {
            if (activity.data && activity.data.object && (Array.isArray(activity.data.object) && activity.data.object[0]['@type'] === 'Comment' || activity.data.object['@type'] === 'Comment' || activity.data.object.text)) {
                return true;
            }
            if (activity.data && activity.data.target && activity.data.target['@type'] === 'Comment') {
                return true;
            }
            return false;
        };

        $scope.showActivityUpdateVersions = function (activity) {
            if (activity.data.type === 'Update') {
                if (activity.data.result && (Array.isArray(activity.data.object) && activity.data.object[0]['@type'] === 'Topic' && activity.data.result[0].path.indexOf('description') > -1 || !Array.isArray(activity.data.object) && activity.data.object['@type'] === 'Topic' && activity.data.result[0].path.indexOf('description') > -1)) {
                    return false;
                }
                if (activity.data.object['@type'] === 'CommentVote' && activity.data.type === 'Update' && activity.data.resultObject && activity.data.resultObject.value === 0) {
                    return false;
                }
                if (
                    activity.data.result && !Array.isArray(activity.data.object) && activity.data.object['@type'] === 'TopicMemberUser' && activity.data.result[0].path.indexOf('level') > -1 && activity.data.result[0].value === 'none'
                ) {
                    return false;
                }
                return true;
            }
            return false;
        };

        $scope.activityRedirect = function (activity) {
            return sActivity.handleActivityRedirect(activity);
        };
    }
]);
