(function() {
    'use strict';
    
    angular.module('sequencer')
        .filter('toDecibels', toDecibels)
        .filter('fromDecibels', fromDecibels);
        
    function toDecibels() {
        return function(gain) {
            gain = parseFloat(gain);
            return 10 * (Math.log(gain) / Math.LN10);
        };
    }
    
    function fromDecibels() {
        return function(db) {
            db = parseFloat(db);
            return Math.pow(10, db / 10);
        };
    }
})();