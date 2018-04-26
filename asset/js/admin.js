var pptData = { "command": "getPresentationList", "service": "UserService" };
var slideViewData = { "command": "getAllPresentation", "service": "UserService" };
var reportdata = { "command": "getReportData", "data": { "userid": 0, "categoryid": 0, "sdate": "", "edate": "" }, "service": "UserService" };
var url = "service/WebService.aspx";
var app = angular.module('myApp', ['ngRoute']);

/* ROUTE CODE */
app.controller('WidgetsController', function($scope) {});
app.controller('MainCtrl', function($scope, $location) {
    $scope.isActive = function(route) {
        return route === $location.path();
    }
});
app.config(function($routeProvider) {
    $routeProvider
        .when('/upload', { templateUrl: 'Templates/upload.html', controller: 'WidgetsController' })
        .when('/presentation', { templateUrl: 'Templates/ppt-view.html', controller: 'slideCtrl' })
        .when('/slides', { templateUrl: 'Templates/slide-view.html', controller: 'pptCtrl' })
        .when('/report', { templateUrl: 'Templates/report.html', controller: 'reportCtrl' })
        .otherwise({ redirectTo: '/upload' });
});

/* slide view page */
app.controller('slideCtrl', function($scope, $http) {
    $http.post(url, slideViewData)
        .then(function(response) {
            $scope.responseSlideData = response.data.result;
        });

    $scope.modal = angular.element(document.querySelector('#myModal'));
    $scope.modalImg = angular.element(document.querySelector("#modalImg"));
    $scope.captionText = angular.element(document.getElementById("caption"));

    $scope.openInPopup = function(e) {
        $($scope.modalImg).attr('src', e.currentTarget.getAttribute("slideViewData-url"));
        $($scope.modal).show(); //css('display', 'block');
        $($scope.captionText).html(e.currentTarget.alt);
    }


    $scope.closePopup = function() {
        $($scope.modal).hide();
    }

    $scope.removeSlide = function(e) {
        var slidId = $(e.currentTarget).next().attr('slideViewData-slideid');
        var parentId = $(e.currentTarget).parent().parent().attr('id');
        $('#' + parentId).parent().remove();
        var slideData = { "command": "deleteAdminSlide", "data": [{ "userid": 0, "slideid": slidId }], "service": "UserService" };
        $http.post("service/WebService.aspx", slideData)
            .then(function(response) {

            });
    }
});

/* report page */
app.controller('reportCtrl', function($scope, $http, $window) {

    $scope.modal = angular.element(document.querySelector('#reportModal'));
    $scope.modalBody = angular.element(document.querySelector('#mBody'));
    $http.post(url, reportdata)
        .then(function(response) {
            $scope.responseReportData = response.data.result;
        });
    $scope.isOpen = false;

    $scope.closeMPopup = function() {
        $($scope.modal).hide();
    }
    $scope.DownloadbyDate = function(e) {
        e.preventDefault();
        var date1 = $('input[name=sample-date]').val();
        var date2 = $('input[name=sample-date1]').val();
        var url = "service/downloadReport.aspx?sdate=" + date1 + "&edate=" + date2;
        var newDate = date2.replace(/-/g, ' ');
        var dateArr = [];
        $('[id ^= row]').each(function(ind) {
            dateArr.push($('#row' + ind + ' td:eq(5)').text());
        });
        var isExist = $scope.isDateExist(dateArr, newDate);
        if (date1 != "" && date2 != "") {
            if (isExist) {
                $window.open(url, "_parent");
            } else {
                $scope.modalBody.html('No report exist for given date period.');
                $scope.modal.show();
                //alert("No Report exist for given date period!!")
            }
        } else {
            $scope.modalBody.html('Please select start & end date to download the report.');
            $scope.modal.show();
        }
    }

    $scope.isDateExist = function(dateAr, newDat) {
        var dateArrLen = dateAr.length;
        for (let i = 0; i < dateArrLen; i++) {
            if (dateAr[i].trim() === newDat.trim()) {
                return true;
            }
        }
    }
    $scope.DownloadbyCategory = function(e) {
        e.preventDefault();
        var url = "service/downloadReport.aspx?category=10";
        $window.open(url, "_parent");
    }
    $scope.DownloadbySlide = function(e) {
        e.preventDefault();
        var url = "service/downloadReport.aspx";
        $window.open(url, "_parent");
    }
});

/* ppt view page */
app.controller('pptCtrl', function($scope, $http) {

    $scope.modal = angular.element(document.querySelector('#pptModal'));
    $scope.modalBody = angular.element(document.querySelector('#mBody'));
    $http.post(url, pptData)
        .then(function(response) {
            $scope.responsePPTData = response.data.result;
        });
    $scope.deletePresentation = function(list) {
        var prsList = [];
        angular.forEach(list, function(value, key) {
            if (list[key].selected == list[key].presentationid) {
                var pIdObj = { "presentationId": list[key].selected }
                prsList.push(pIdObj);
            }
        });
        if (prsList.length > 0) {
            for (var i = 0; i < prsList.length; i++) {
                $('#prs' + prsList[i].presentationId).remove();
            }
            var prsData = { "command": "deleteAdminPresentation", "data": prsList, "service": "UserService" };
            $scope.modalBody.html('Presentation will be removed.');
            $scope.modal.show();
            $http.post("service/WebService.aspx", prsData)
                .then(function(response) {
                    $scope.responseData = response.data.result;
                    if ($scope.responseData) {
                        $http.post(url, pptData)
                            .then(function(response) {
                                $scope.responsePPTData = response.data.result;
                            });
                    }
                });
        } else {
            $scope.modalBody.html('Please select an presentation to delete.');
            $scope.modal.show();
        }
    };

    $scope.closePPopup = function() {
        $($scope.modal).hide();
    }
});
/*app.filter('custom', function() {
    return function(input, search) {
        if (!input) return input;
        if (!search) return input;
        var expected = ('' + search).toLowerCase();
        var result = {};
        angular.forEach(input, function(value, key) {
            var actual = ('' + value).toLowerCase();
            if (actual.indexOf(expected) !== -1) {
                result[key] = value;
            }
        });
        return result;
    }
});*/