(function() {
    'use strict';
    
    angular.module('sequencer')
        .controller('MainCtrl', MainCtrl);
        
    /* @ngInject */
    function MainCtrl($interval, $window, scaleService) {
        var audioCtx = new AudioContext();
        
        var vm = this;
        
        vm.Math = window.Math;
        
        vm.masterVolume = audioCtx.createGain();
        vm.masterVolume.gain.value = 0.2;
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
                
        vm.currentMatrix = new SequencerMatrix(audioCtx, vm.masterVolume, vm.beatCount);
        
        vm.availableScales = scaleService.getAvailableScales();
        vm.scale = scaleService.getNotes({name: 'A', octave: 3}, 'minor', 2);
        
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
            
            vm.currentMatrix.setPageLength(vm.beatCount);
        };
        
        vm.generateNewScale = function() {
            vm.stop();
            vm.currentMatrix.clear();
            
            vm.scale = scaleService.getNotes(vm.newScale.startNote, vm.newScale.key, vm.newScale.octaves);
        };
        
        vm.toggleAudioCell = function(beat, note) {
            vm.currentMatrix.toggleAudioCell(beat, note);
        };
        
        vm.paintAudioCells = function(beat, note) {
            if (vm.mouseDown) {
                vm.toggleAudioCell(beat, note);
            }
        };
        
        vm.getAudioCell = function(beat, note) {
            return vm.currentMatrix.getAudioCell(beat, note);
        };
        
        vm.toggleWaveType = function() {
            var waveIndex = waveTypes.indexOf(vm.waveType);
            
            vm.waveType = waveTypes[(waveIndex + 1) % waveTypes.length];
            
            vm.currentMatrix.setWaveType(vm.waveType);
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
            vm.currentMatrix.playAudioCells(vm.beatDuration);
        };
        
        vm.clear = function() {
            vm.currentMatrix.clear();
        };
        
        var lastUpdate = 0;
        function update() {
            vm.currentMatrix.update(vm.beatDuration);
            
            var now = window.performance.now();
            // console.log(now - lastUpdate);
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