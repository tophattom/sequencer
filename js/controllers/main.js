(function() {
    'use strict';
    
    angular.module('sequencer')
        .controller('MainCtrl', MainCtrl);
        
    /* @ngInject */
    function MainCtrl($interval, $window) {
        var audioCtx = new AudioContext();
        
        var vm = this;
        
        vm.Math = window.Math;
        
        vm.bpm = 160;
        vm.beatDuration = 60 / vm.bpm;
        
        vm.bars = 4;
        vm.beatsPerBar = 4;
        
        vm.beats = 16;
        
        vm.currentBeat = 0;
        
        vm.playing = false;
        vm.player = null;
        
        vm.audioCells = [];
        
        vm.scaleDefinitions = [
            {
                scale: 'minor', 
                pianoKeys: [49, 51, 52, 54, 56, 57, 59, 61]
            },
            {
                scale: 'major',
                pianoKeys: [49, 51, 53, 54, 56, 58, 60, 61]
            }
        ];
        
        vm.scale = getScale(vm.scaleDefinitions[0], -1, 0);
        
        vm.masterVolume = audioCtx.createGain();
        vm.masterVolume.gain.value = 0.2;
        vm.masterVolume.connect(audioCtx.destination);
        
        vm.getBeats = function() {
            return new Array(vm.bars * vm.beatsPerBar);
        };
        
        vm.toggleAudioCell = function(beat, note) {
            if (!vm.audioCells[beat]) {
                vm.audioCells[beat] = [];
            }
            
            if (!vm.audioCells[beat][note.index]) {
                var newCell = new AudioCell(audioCtx, vm.masterVolume, note.freq);
                vm.audioCells[beat][note.index] = newCell;
            } else {
                vm.audioCells[beat][note.index] = null;
            }
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
            
            vm.playing = true;
            
            vm.player = $interval(update, vm.beatDuration * 1000);
            playAudioCells(vm.currentBeat);
        };
        
        vm.clear = function() {
            vm.audioCells = [];
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
                if (cell !== null) {
                    cell.start();
                    cell.stop(vm.beatDuration);
                }
            });
        }
        
        function getScale(scaleDefinition, startOctave, endOctave) {
            var scale = [];
            
            for (var octave = startOctave; octave <= endOctave; octave++) {                
                scale = scale.concat(scaleDefinition.pianoKeys.map(function(keyNumber, index) {
                    return Math.pow(2, (keyNumber + 12 * octave - 49) / 12) * 440;
                }));
            }
                        
            return scale.filter(function(elem, index) {
                return scale.indexOf(elem) === index;
            }).map(function(freq, index) {
                return {
                    freq: freq,
                    index: index
                };
            });
        }
        
        $window.addEventListener('keypress', function(event) {
            if (event.keyCode === 32) {
                if (vm.playing) {
                    vm.stop();
                } else {
                    vm.start();
                }
            }
        });
    }
})();