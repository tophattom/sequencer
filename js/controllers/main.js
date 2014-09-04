(function() {
    'use strict';
    
    angular.module('sequencer')
        .controller('MainCtrl', MainCtrl);
        
    /* @ngInject */
    function MainCtrl($interval) {
        var audioCtx = new AudioContext();
        
        var vm = this;
        
        vm.bpm = 160;
        vm.beatDuration = 60 / vm.bpm;
        
        vm.beats = 16;
        
        vm.currentBeat = 0;
        
        vm.playing = false;
        vm.player = null;
        
        vm.audioCells = [];
        
        vm.scale = [
            {freq: 440, index: 0},
            {freq: 493.88, index: 1},
            {freq: 523.25, index: 2},
            {freq: 587.33, index: 3},
            {freq: 659.26, index: 4},
            {freq: 698.46, index: 5},
            {freq: 783.99, index: 6},
            {freq: 880, index: 7}
        ];
        
        vm.masterVolume = audioCtx.createGain();
        vm.masterVolume.gain.value = 0.2;
        vm.masterVolume.connect(audioCtx.destination);
        
        vm.getBeats = function() {
            return new Array(vm.beats);
        };
        
        vm.addAudioCell = function(beat, note) {
            console.log(beat);
            if (!vm.audioCells[beat]) {
                vm.audioCells[beat] = [];
            }
            
            var newCell = new AudioCell(audioCtx, vm.masterVolume, note.freq);
            vm.audioCells[beat][note.index] = newCell;
        };
        
        vm.getAudioCell = function(beat, note) {
            if (!vm.audioCells[beat]) {
                return null;
            }
            
            return vm.audioCells[beat][note.index] ? vm.audioCells[beat][note.index] : null;
        };
        
        vm.stop = function() {
            if (!vm.playing) {
                return;
            }
            
            $interval.cancel(vm.player);
            vm.playing = false;
            vm.currentBeat = 0;
        };
        
        vm.start = function() {
            if (vm.playing) {
                return;
            }
            
            playAudioCells(vm.currentBeat);
            vm.player = $interval(update, vm.beatDuration * 1000);
            vm.playing = true;
        };
        
        var lastUpdate = 0;
        function update() {
            vm.currentBeat = (vm.currentBeat + 1);
            
            if (vm.currentBeat >= vm.beats) {
                vm.currentBeat = 0;
            }
            playAudioCells(vm.currentBeat);
            
            var now = window.performance.now();
            // console.log(now - lastUpdate);
            lastUpdate = now;
        }
        
        function playAudioCells(beat) {
            if (!vm.audioCells[beat]) {
                return;
            }
            
            vm.audioCells[beat].forEach(function(cell) {
                cell.start();
                cell.stop(vm.beatDuration);
            });
        }
    }
})();