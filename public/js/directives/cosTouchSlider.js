angular
    .module('citizenos')
    .directive('slideController', ['$swipe', '$rootScope', '$window', '$parse',
        function ($swipe, $rootScope, $window, $parse) {

            return {
                restrict: 'EA',
                /* Do one-way binding for attribute start_slide_at, NOTE camelcase */
                scope: {
                    startSlideAt: '@',
                    identifier: '@',
                    class: '@'
                },
                link: function (scope, element, attrs) {
                    /* Define multiple variables */
                    var startX, elementX_start, elementX_live, element_max_distance_left, target_position, last_element_position, element_drag_speed, stop_position, ease_animation, new_element_position, neg_ili_pos, moved_amount, element_style;
                    var speeding_ticket;

                    /* Guarantee that on window resize the position of the slidable object won't break */
                    var moved_percent = scope.identifier + '.moved_percent';

                    scope.getWindowDimensions = function () {
                        return {
                            'w': window.innerWidth
                        };
                    };

                    element_style = $window.getComputedStyle(element[0], null);

                    /* This function needs to run on start up and on resize of the window */
                    function run_me_twice() {
                        element_max_distance_left = $rootScope.wWidth - Number(element_style.getPropertyValue('width').replace('px', '')) - 20;

                        element[0].style.marginLeft = element_max_distance_left * ($rootScope.$eval(moved_percent) / 100) + 'px';

                        if (element_max_distance_left > 0) {
                            element[0].style.marginLeft = 0;
                        }

                    }


                    scope.check_width = setInterval(function () {
                        if (element_style.getPropertyValue('width') != '100%' && element_style.getPropertyValue('width') != '0px') {
                            run_me_twice();
                            clearInterval(scope.check_width);
                        }
                    }, 50);


                    /* On window resize reposition elements */
                    scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                        if (newValue != oldValue) {
                            run_me_twice();
                        }
                    }, true);


                    /* Start touch-drag code */
                    $swipe.bind(element, {
                        'start': function (coords) {

                            /* Get mouse starting coordinates */
                            startX = coords.x;
                            /* Get target element starting position */
                            elementX_start = Number(element_style.getPropertyValue('margin-left').replace('px', ''));


                            /* Clear interval that was set on drag end */
                            clearInterval(ease_animation);

                            last_element_position = element_style.getPropertyValue('margin-left').replace('px', '');


                            /* Get current speed of draggable object */
                            speeding_ticket = setInterval(function () {
                                new_element_position = element_style.getPropertyValue('margin-left').replace('px', '');
                                element_drag_speed = Math.abs(last_element_position - new_element_position);

                                /* Limit maximum drag speed */
                                if (element_drag_speed > 8) {
                                    element_drag_speed = 8;
                                }

                                /* Check which way the object was moved (left or right) */
                                if (last_element_position - new_element_position >= 0) {
                                    element_drag_speed *= -1;
                                }

                                /* Update kast element position to use it in new interval */
                                last_element_position = element_style.getPropertyValue('margin-left').replace('px', '');

                            }, 20);


                        },
                        'move': function (coords) {

                            /* Only do start draggin motion if window width is at lower than defined variable in DOM */
                            if (scope.startSlideAt >= $rootScope.wWidth) {
                                /* Get delta by subtracting mouse drag start coordinates by current live mouse coordinates */
                                var delta = coords.x - startX;

                                /* Set element position vairable */
                                elementX_live = elementX_start + delta;
                                /* Make sure div stays inside boundaries and if it's outside, set correct position */
                                if (elementX_live > element_max_distance_left && elementX_live < 0) {
                                    target_position = elementX_live;
                                } else if (elementX_live < element_max_distance_left && elementX_live < 0) {
                                    target_position = element_max_distance_left;
                                } else if (elementX_live > 0) {
                                    target_position = 0;
                                }

                                /* Set element position live */
                                element[0].style.marginLeft = target_position + 'px';

                            }
                        },
                        'end': function (coords) {

                            /* Clear interval that was set on drag start */
                            clearInterval(speeding_ticket);
                            /* Get current position of the element */
                            var elementX_current_position = Number(element_style.getPropertyValue('margin-left').replace('px', ''));

                            /* Ease element to final position */
                            /* Only do the ease if easing speed is greater than 0 and the element is inside the boundaries and not at the sides of the boundaries */
                            if (element_drag_speed != 0 && elementX_current_position != 0 && elementX_current_position != element_max_distance_left) {

                                /* Set interval for easing animation */
                                ease_animation = setInterval(function () {

                                    /* Set deceleration speed */
                                    element_drag_speed = element_drag_speed / 1.1;
                                    elementX_current_position = Number(element_style.getPropertyValue('margin-left').replace('px', '')) + element_drag_speed;

                                    /* If element's speed is lower than 0.1 stop the interval to avoid unneeded calculations */
                                    if (Math.abs(element_drag_speed) < 0.1) {
                                        clearInterval(ease_animation);
                                        /* Make sure div stays inside boundaries and if it's outside, set correct position */
                                    } else if (elementX_current_position < element_max_distance_left && elementX_current_position < 0) {
                                        stop_position = element_max_distance_left;
                                        clearInterval(ease_animation);
                                        /* Make sure div stays inside boundaries and if it's outside, set correct position */
                                    } else if (elementX_current_position > 0) {
                                        stop_position = 0;
                                        clearInterval(ease_animation);
                                    } else {
                                        stop_position = elementX_current_position;
                                    }
                                    /* Move the element according to final easing speed */
                                    element[0].style.marginLeft = stop_position + 'px';
                                }, 10);
                            }

                            /* Get the final position of the element */
                            var elementX_end = Number(element_style.getPropertyValue('margin-left').replace('px', ''));

                            /* Set the percentage variable to be used in case of window resize, set it to rootScope so it can be used again when leaving the page */
                            moved_amount = (((element_max_distance_left - elementX_end)) / element_max_distance_left) * -100 + 100;
                            $parse(moved_percent).assign($rootScope, moved_amount);
                        },
                        'cancel': function (coords) {
                            clearInterval(speeding_ticket);
                        }
                    });
                }
            }
        }]);


angular
    .module('citizenos')
    .directive('dimensions', ['$swipe', '$rootScope', '$window', '$parse',
        function ($swipe, $rootScope, $window, $parse) {
            return {
            link: function (scope, elem) {
                $rootScope.tabs_train_width = elem[0].parentElement.offsetWidth;
                $rootScope.tabs_visible_area_width = elem[0].parentElement.parentElement.parentElement.offsetWidth;
                console.log($rootScope.tabs_train_width);
            }
        }
    }
]);