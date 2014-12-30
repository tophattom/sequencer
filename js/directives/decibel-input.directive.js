(function() {
    'use strict';
    
    angular.module('sequencer')
        .directive('decibelInput', decibelInput);
        
    function decibelInput($parse, toDecibelsFilter, fromDecibelsFilter, numberFilter) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(fromDecibelsFilter);
                
                modelCtrl.$formatters.push(function(modelValue) {
                    return numberFilter(toDecibelsFilter(modelValue), 2);
                });
            }
        };
    }
})();