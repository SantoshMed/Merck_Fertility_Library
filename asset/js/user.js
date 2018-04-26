var trackdata = { "command": "getTrackedSlides", "service": "UserService" };
var data = { "command": "getAllPresentation", "service": "UserService" };
var url = "service/WebService.aspx";
var app = angular.module('userApp', ['ngRoute', 'ngCookies']);
/* ROUTE CODE */
app.controller('WidgetsController', ['$scope', '$rootScope', '$compile', '$route', '$http', 'init', function($scope, $rootScope, $http, $compile, $route, init) {
    init();
}]);
app.controller('userCtrl', function($scope, $http, $location, $rootScope, $timeout, $cookies) {
    $scope.isActive = function(route) {
        return route === $location.path();
    }

    //Notification 
    var newPres = { "command": "getNotification", "data": 10, "service": "UserService" };
    $http.post("service/WebService.aspx", newPres)
        .then(function(response) {
            var resp = response.data.result;
            if (resp.length > 0) {
                $rootScope.notification = true;
            }
        });
    $rootScope.tooltip = false;

    $scope.showNotification = function(e) {
        var notCls = e.currentTarget.className;
        var notfCls = notCls.split(' ')[2];
        if (notfCls) {
            $rootScope.tooltip = true;
            $rootScope.notification = false;
            $timeout(function() {
                $rootScope.tooltip = false;
            }, 3000);
        }
    }

    //User Authentication

    $scope.usertype = 0;
    var uuid = $cookies.get('uuid');
    //var uuid = "224a58d4-eb18-4a91-939a-6670673463ad";
    /*if (!uuid) {
        console.log("UUID: " + uuid);
        window.location = "https://www.professionalsinfertility.com/en/home/fertility-library.html"
    } else {
        var authUser = { "command": "authenticateUser", "data": uuid, "service": "UserService" };
        $http.post("service/WebService.aspx", authUser).then(function(response) {
            //$scope.usertype = response.data.result[0].usertype;
        });
    }*/
});
app.run(function($rootScope) {
    $rootScope.count = 0;
})
app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'Templates/home.html',
            controller: 'WidgetsController',
            resolve: {
                init: function($http, $rootScope) {
                    return function() {
                        var actvSld = { "command": "getActiveSlides", "data": 0, "service": "UserService" };
                        $http.post("service/WebService.aspx", actvSld).then(function(response) {
                            $rootScope.slideCount = response.data.result.length;
                        });
                        var dwnRpt = { "command": "getReportData", "data": { "userid": "", "categoryid": 0, "sdate": "", "edate": "" }, "service": "UserService" };
                        $http.post("service/WebService.aspx", dwnRpt).then(function(response) {
                            var download = response.data.result;
                            var downloadArr = [];
                            for (let i = 0; i < download.length; i++) {
                                if (download[i]['no of downloads'] > 0) {
                                    downloadArr.push(download[i]['slide name'])
                                }
                            }
                            $rootScope.downloadedFile = downloadArr.length;
                        });
                    }
                }
            }
        })
        .when('/create', {
            templateUrl: 'Templates/create.html',
            controller: 'WidgetsController',
            resolve: {
                init: function($http, $rootScope, $compile) {
                    return function() {
                        var sldRData = { "command": "getActiveSlides", "data": 0, "service": "UserService" };
                        $http.post("service/WebService.aspx", sldRData)
                            .then(function(response) {
                                var resp = response.data.result;
                                angular.forEach(resp, function(value, key) {
                                    var li = $("<li class='ui-state-default'></li>");
                                    var $newBtn = $("<button ng-click='deleteImg($event)'><i class='fa fa-minus' aria-hidden='true'></i></button>");
                                    var $newDiv = "<img class='img-responsive' id='imDiv" + value.slideid + "_" + $rootScope.count + "' src='service/getImage.aspx?Id=" + value.slideid + "&amp;type=small' alt='" + value.slidename + "'>"
                                    $compile($newBtn)($rootScope);
                                    li.append($newBtn);
                                    li.append($newDiv);
                                    $("#clonedImg ul").append(li);
                                    $rootScope.count += 1;
                                });
                            });
                    }
                }
            }
        })
        .otherwise({ redirectTo: "/home" });
});



/* home page code */
app.controller('newSlide', function($scope, $http) {
    $http.post(url, data)
        .then(function(response) {
            $scope.responsenewSlideData = response.data.result;
        });
});

app.controller('MostSearched', function($scope, $http) {
    $http.post(url, trackdata)
        .then(function(response) {
            $scope.responseData = response.data.result;
        });

});

app.controller('MostViewed', function($scope, $http) {
    $http.post(url, trackdata)
        .then(function(response) {
            $scope.responseData = response.data.result;
        });

});

app.controller('MostDownloaded', function($scope, $http) {
    $http.post(url, trackdata)
        .then(function(response) {
            $scope.responseData = response.data.result;
        });

});

/* create page code */
app.controller('createCtrl', function($scope, $rootScope, $http, $compile, $window) {
    $http.post(url, data)
        .then(function(response) {
            $scope.responseSlideData = response.data.result;
        });
    /* POPUP CODE */
    $scope.modal = angular.element(document.querySelector('#myModal'));
    $scope.modalImg = angular.element(document.querySelector("#modalImg"));
    $scope.captionText = angular.element(document.getElementById("caption"));
    var $newBtn;
    $scope.openInPopup = function(e) {
        $($scope.modalImg).attr('src', e.currentTarget.getAttribute("data-url"));
        $($scope.modal).show(); //css('display', 'block');
        $($scope.captionText).html(e.currentTarget.alt);
    }

    $scope.closePopup = function() {
        $($scope.modal).hide();
    }

    $scope.cloneImg = function(e) {
        var $newDiv = $(e.currentTarget).next().clone();
        var li = $("<li class='ui-state-default'></li>");
        $newBtn = $("<button ng-click='deleteImg($event)'><i class='fa fa-minus' aria-hidden='true'></i></button>");
        var slidId = $newDiv.attr("data-slideid");
        $newDiv.prop('id', 'imDiv' + slidId + '_' + $rootScope.count);
        $compile($newBtn)($scope);
        li.append($newBtn);
        li.append($newDiv);
        $("#clonedImg ul").append(li);
        var slidId = $newDiv.attr("data-slideid");
        var slideData = { "command": "addUserSlide", "data": { "slideid": slidId, "ordernumber": $rootScope.count }, "service": "UserService" };
        $http.post("service/WebService.aspx", slideData)
            .then(function(response) {
                $rootScope.count++;
            });

        $("#sortable").sortable({
            update: function(e, ui) {
                var newIndex = ui.item.index();
                var slidId = $(ui.item).find('img').attr("data-slideid");
                var slideData = { "command": "addUserSlide", "data": { "slideid": slidId, "ordernumber": newIndex }, "service": "UserService" };
                $http.post("service/WebService.aspx", slideData)
                    .then(function(response) {
                        $rootScope.count++;
                    });
            }
        });
        $("#sortable").disableSelection();

    }

    $rootScope.deleteImg = function(e) {
        var slidId = $(e.currentTarget).next().attr('data-slideid');
        $(e.currentTarget).parent().remove();
        $(e.currentTarget).remove();
        $(e.currentTarget).next().attr('id')
        $('#' + $(e.currentTarget).next().attr('id')).remove();
        var sldData = { "command": "deleteUserSlide", "data": [{ "userid": 0, "slideid": slidId }], "service": "UserService" };
        $http.post("service/WebService.aspx", sldData).then(function(response) {});
    }
    $scope.downloadPresentation = function(e) {
        e.preventDefault();
        var url = "service/downloadActive.aspx?id=0";
        if ($('#sortable').has("li").length != 0) {
            $window.open(url, "_parent");
        }
        $http.post("service/downloadActive.aspx?id=0").then(function(response) {
            $("#clonedImg ul").html("");
            $rootScope.count = 0;
        });
    }

    $scope.clearImages = function(e) {
        var slideArray = [];
        $rootScope.count = 0;
        $('#sortable li img').each(function(index) {
            var str = $(this).attr('id').split('_')[0];
            str = str.replace(/^\D+/g, '');
            slideArray.push({ "userid": 0, "slideid": str });
        });
        var sldRData = { "command": "deleteUserSlide", "data": slideArray, "service": "UserService" };
        $http.post("service/WebService.aspx", sldRData).then(function(response) {});
        $("#clonedImg ul").html("");
    }
    //$scope.slideId = [];
});