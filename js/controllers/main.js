(function() {
    'use strict';
    
    angular.module('sequencer')
        .controller('MainCtrl', MainCtrl);
        
    /* @ngInject */
    function MainCtrl($interval, $window, scaleService) {
        var audioCtx = new AudioContext();
        
        var vm = this;
        
        vm.Math = window.Math;
        
        vm.bpm = 160;
        vm.beatDuration = 60 / vm.bpm;
        
        vm.bars = 4;
        vm.beatsPerBar = 4;
        
        vm.beatCount = vm.bars * vm.beatsPerBar;
        vm.beats = new Array(vm.beatCount); //Dummy array for ng-repeat
        
        vm.currentBeat = 0;
        
        vm.playing = false;
        vm.player = null;
        
        vm.audioCells = [];
        
        vm.availableScales = scaleService.getAvailableScales();
        vm.scale = scaleService.getNotes({name: 'A', octave: 3}, 'minor', 2);
        
        vm.masterVolume = audioCtx.createGain();
        vm.masterVolume.gain.value = 0.2;
        vm.masterVolume.connect(audioCtx.destination);
        
        var waveTypes = ['sine', 'triangle', 'square', 'sawtooth'];
        vm.waveType = 'sine';
        
        vm.newScale = {
            key: 'minor',
            startNote: {
                name: 'A',
                octave: 3
            },
            octaves: 2
        };
        
        vm.mouseDown = false;
        
        vm.bpmChanged = function() {
            vm.stop();
            vm.beatDuration = 60 / vm.bpm;
        };
        
        vm.lengthChanged = function() {
            var oldBeatCount = vm.beatCount;
            
            vm.beatCount = vm.bars * vm.beatsPerBar;
            vm.beats = new Array(vm.beatCount);
            
            if (oldBeatCount > vm.beatCount) {
                vm.audioCells.splice(vm.beatCount, oldBeatCount - vm.beatCount);
            }
        };
        
        vm.generateNewScale = function() {
            vm.stop();
            vm.audioCells = [];
            
            vm.scale = scaleService.getNotes(vm.newScale.startNote, vm.newScale.key, vm.newScale.octaves);
        };
        
        vm.toggleAudioCell = function(beat, note) {
            if (!vm.audioCells[beat]) {
                vm.audioCells[beat] = [];
            }
            
            if (!vm.audioCells[beat][note.index]) {
                var newCell = new AudioCell(audioCtx, vm.masterVolume, note.freq, vm.waveType);
                vm.audioCells[beat][note.index] = newCell;
            } else {
                vm.audioCells[beat][note.index] = null;
            }
        };
        
        vm.paintAudioCells = function(beat, note) {
            if (vm.mouseDown) {
                vm.toggleAudioCell(beat, note);
            }
        };
        
        vm.getAudioCell = function(beat, note) {
            if (!vm.audioCells[beat]) {
                return null;
            }
            
            return vm.audioCells[beat][note.index] ? vm.audioCells[beat][note.index] : null;
        };
        
        vm.toggleWaveType = function() {
            var waveIndex = waveTypes.indexOf(vm.waveType);
            
            vm.waveType = waveTypes[(waveIndex + 1) % waveTypes.length];
            
            changeWaveType(vm.waveType);
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
            vm.currentBeat = (vm.currentBeat + 1) % vm.beatCount;
            
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
        
        function changeWaveType(newWaveType) {
            vm.audioCells.forEach(function(beat) {
                beat.forEach(function(cell) {
                    if (cell !== null) {
                        cell.osc.type = newWaveType;
                    }
                });
            });
        }
        
        $window.addEventListener('keypress', function(event) {
            if (event.keyCode === 32 || event.charCode === 32) {
                if (vm.playing) {
                    vm.stop();
                } else {
                    vm.start();
                }
            }
        });
    }
})();