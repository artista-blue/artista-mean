Controllers.controller('Controller', ['$scope', %s, function($scope, %s) {

%s

    $scope.delete = function ($index, collection) {
	var item = collection[$index];
	collection.splice($index, 1);
	item.$delete();
    };
}]);
