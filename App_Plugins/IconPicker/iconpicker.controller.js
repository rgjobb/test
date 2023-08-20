angular.module("umbraco").controller("IconPicker.Controller", function ($scope, $http, assetsService, editorService, /*dialogService,*/ notificationsService) {
	////////////////
	// Setup
	////////////////
	
	$scope.icons = [];
	$scope.iconPattern = '<i class="fa {0}"></i>';
	$scope.overlay = {
		view: '/app_plugins/iconpicker/dialogs/iconpicker.dialog.html?v=1',
    size: "small",
		title: 'Select an icon',
		selectIcon: function(icon) {
      editorService.close($scope.overlay);

			$scope.model.value = icon;
		},
		close: function() {
      editorService.close($scope.overlay);
		}
	};

	if ($scope.model.config.iconPattern != null && $scope.model.config.iconPattern != '') {
		$scope.iconPattern = $scope.model.config.iconPattern;
	};

	//////////////////////
	// Private functions
	//////////////////////
	
	// Get the matching class names from the stylesheet
	var getClassNames = function () {
    var cssPath = "/app_plugins/iconpicker/icons-picker.css";
    var cssRegexPattern = "(fa-[^:]*?):before";
    var iconPattern = '<i class="fa {0}"></i>';
		var cssRegex = new RegExp(cssRegexPattern, 'g');
		var matches = [];
		var isError = false;



		// Get the class names from the specified stylesheet,
		// use angular http request to make a cached request for the stylesheet content.
		$http({
			method: 'GET', 
			url: cssPath,
			cache: true
    }).then(function successCallback(response) {

			var cssText = response.data;
			var hasMatches = cssRegex.test(cssText);

			//reset regex
			cssRegex.compile(cssRegexPattern, "g");

			if (hasMatches) {
				var match = cssRegex.exec(cssText);

				while (match != null) {
					match = cssRegex.exec(cssText);

					// check if match has populated array
					if (match != null && match.length > 1) {
						//check if array already contains match and not on exclude list
						if (!(matches.indexOf(match[1]) > 0)) {
							matches.push(match[1]);
							hasMatches = true;
						}
					}
				}
			}

			matches.sort();

			if (!hasMatches && !isError) {
				isError = true;

				notificationsService.error('An error has occured.', 'No matches in stylesheet for regex: ' + cssRegexPattern);
			}
    }, function errorCallback(data, status, headers, config) {
			notificationsService.error('An error has occured.', 'Stylesheet or file ' + cssPath + ' not found on server.');
			isError = true;
		});

		if (!/css$/.test(cssPath)) {
			cssPath = cssPath.split('.')[0] + '.css';
		}

		// Load the supplied css stylesheet using the umbraco assetsService
		assetsService.loadCss(cssPath);

		return matches;
	};

	//////////////////////
	// Scope functions
	//////////////////////
	
	$scope.openIconPickerDialog = function() {
		/*$scope.overlay.show = true;*/
		$scope.overlay.icons = $scope.icons;
		$scope.overlay.renderIconPattern = $scope.renderIconPattern;
    $scope.overlay.iconPattern = $scope.iconPattern;
    editorService.open($scope.overlay);
	};

	// Write out the HTML for the current element class name using the icon pattern.
	$scope.renderIconPattern = function (currentClassName) {
		return $scope.iconPattern.replace("{0}", currentClassName);
	};

	$scope.remove = function() {
		$scope.model.value = '';
	};

	//////////////
	// Load
	//////////////

	$scope.icons = getClassNames();
});
