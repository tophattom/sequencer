(function() {
    'use strict';
    
    angular.module('sequencer')
        .controller('MainCtrl', MainCtrl);
        
    /* @ngInject */
    function MainCtrl($interval, $window, scaleService, toDecibelsFilter) {
        var audioCtx = new AudioContext();
        
        var vm = this;
        
        vm.Math = window.Math;
        
        vm.masterVolume = audioCtx.createGain();
        vm.masterVolume.gain.value = 1.0;
        vm.masterVolume.connect(audioCtx.destination);
        
        vm.bpm = 160;
        vm.beatDuration = 60 / vm.bpm;
        
        vm.bars = 4;
        vm.beatsPerBar = 4;
        
        vm.beatCount = vm.bars * vm.beatsPerBar;
        vm.beats = new Array(vm.beatCount); //Dummy array for ng-repeat
        
        vm.currentBeat = 0;
        
        vm.playing = false;
        vm.player = null;
                
        vm.matrices = [
            new SequencerMatrix(audioCtx, vm.masterVolume, vm.beatCount)
        ];
        vm.currentMatrix = vm.matrices[0];
        
        vm.showPopup = {
            global: false,
            matrix: false,
            mixer: false
        };
        
        vm.availableScales = scaleService.getAvailableScales();
        vm.scale = scaleService.getNotes({name: 'A', octave: 3}, 'minor', 2);
        
        var waveTypes = ['sine', 'triangle', 'square', 'sawtooth'];
                
        vm.newScale = {
            key: 'minor',
            startNote: {
                name: 'A',
                octave: 3
            },
            octaves: 2
        };
        
        vm.mouseDown = false;
        
        vm.togglePopup = function(popupKey) {
            for (var key in vm.showPopup) {
                if (popupKey === key) {
                    vm.showPopup[key] = !vm.showPopup[key];
                } else {
                    vm.showPopup[key] = false;
                }
            }
        };
        
        vm.bpmChanged = function() {
            vm.stop();
            vm.beatDuration = 60 / vm.bpm;
        };
        
        vm.lengthChanged = function() {
            var oldBeatCount = vm.beatCount;
            
            vm.beatCount = vm.bars * vm.beatsPerBar;
            vm.beats = new Array(vm.beatCount);
            
            vm.matrices.forEach(function(matrix) {
                matrix.setPageLength(vm.beatCount);
            });
        };
        
        vm.generateNewScale = function() {
            vm.stop();
            
            vm.matrices.forEach(function(matrix) {
                matrix.clear();
            });
            
            vm.scale = scaleService.getNotes(vm.newScale.startNote, vm.newScale.key, vm.newScale.octaves);
        };
        
        vm.addMatrix = function() {
            vm.matrices.push(new SequencerMatrix(audioCtx, vm.masterVolume, vm.beatCount));
        };
        
        vm.deleteMatrix = function(index) {
            if (vm.matrices.length < 2) {
                return;
            }
            
            if (vm.matrices[index] === vm.currentMatrix) {
                if (index === 0) {
                    vm.currentMatrix = vm.matrices[1];
                } else {
                    vm.currentMatrix = vm.matrices[index - 1];
                }
            }
            
            vm.matrices.splice(index, 1);
        };
        
        vm.handleMouseDown = function(event, beat, note, subBeat) {
            vm.mouseDown = true;
        
            if (event.altKey) {
                var currentParts = vm.currentMatrix.getAudioCell(beat, note).length,
                    newParts = (((currentParts || 1) + 1) % 5) || 1;
                
                vm.currentMatrix.splitAudioCell(beat, note, newParts);
            } else {
                vm.currentMatrix.toggleAudioCell(beat, note, subBeat);
            }
        };
        
        vm.handleMouseEnter = function(event, beat, note, subBeat) {
            if (vm.mouseDown) {
                vm.currentMatrix.toggleAudioCell(beat, note, subBeat);
            }
        };
        
        vm.toggleWaveType = function() {
            var waveIndex = waveTypes.indexOf(vm.currentMatrix.waveType);
            
            var newWaveType = waveTypes[(waveIndex + 1) % waveTypes.length];
            
            vm.currentMatrix.setWaveType(newWaveType);
        };
        
        vm.stop = function() {
            if (!vm.playing) {
                return;
            }
            
            $interval.cancel(vm.player);
            vm.playing = false;
            
            vm.matrices.forEach(function(matrix) {
                matrix.currentBeat = 0;
            });
        };
        
        vm.start = function() {
            if (vm.playing) {
                return;
            }
            
            vm.playing = true;
            
            vm.player = $interval(update, vm.beatDuration * 1000);
            
            vm.matrices.forEach(function(matrix) {
                matrix.playAudioCells(vm.beatDuration);
            });
        };
        
        vm.clear = function() {
            vm.currentMatrix.clear();
        };
        
        var lastUpdate = 0;
        function update() {
            vm.matrices.forEach(function(matrix) {
                matrix.update(vm.beatDuration);
            });
            
            var now = window.performance.now();
            console.log(now - lastUpdate - vm.beatDuration * 1000);
            lastUpdate = now;
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