Controllers.controller('%sController', ['$scope', '%s', function($scope, %s) {

    $scope.%s = %s.query();

    $scope.delete = function ($index, collection) {
	const item = collection[$index];
	collection.splice($index, 1);
	%s.delete({id: item._id}, function (err) {
            $scope.%s = %s.query();	    
	});
    };

    $scope.append = function (_newItem) {
        const newItem = new %s(_newItem);
        newItem.$save(function (err) {
            $scope.%s = %s.query();
        });
    };    
}]);
