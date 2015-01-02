(function() {
    'use strict';
    
    angular.module('sequencer')
        .factory('InstrumentService', InstrumentService);
        
    function InstrumentService() {
        var instruments = {
            sine: {
                waveType: 'sine',
                name: 'Sine wave',
                attack: 0,
                decay: 0,
                sustain: 1,
                release: 0
            },
            sawtooth: {
                waveType: 'sawtooth',
                name: 'Sawtooth wave',
                attack: 0,
                decay: 0,
                sustain: 1,
                release: 0
            },
            square: {
                waveType: 'square',
                name: 'Square wave',
                attack: 0,
                decay: 0,
                sustain: 1,
                release: 0
            },
            triangle: {
                waveType: 'triangle',
                name: 'Triangle wave',
                attack: 0,
                decay: 0,
                sustain: 1,
                release: 0
            },
            xylosynth: {
                name: 'Xylosynth',
                waveType: 'custom',
                harmonics: [0, 1, 0.3, 0.1, 0.3, 0.1, 0.3],
                attack: 0.015,
                decay: 0,
                sustain: 1,
                release: 0.2
            },
            bass: {
                name: 'Bass',
                waveType: 'custom',
                harmonics: [0, 1, 0.2, 0.3, 0.2, 0.15, 0.1],
                attack: 0.03,
                decay: 0.01,
                sustain: 0.5,
                release: 0.7
            }
        };
        
        var service = {
            getAvailableInstruments: getAvailableInstruments,
            getInstrument: getInstrument
        };
        
        function getAvailableInstruments() {
            return Object.keys(instruments).map(function(instrumentKey) {
                return {
                    instrumentKey: instrumentKey,
                    name: instruments[instrumentKey].name
                };
            });
        }
        
        function getInstrument(instrumentKey, audioCtx) {
            var instrument = instruments[instrumentKey],
                finalInstrument = angular.copy(instrument);
                
            finalInstrument.instrumentKey = instrumentKey;
            
            if (instrument.waveType !== 'custom') {
                return finalInstrument;
            } else {
                var real = new Float32Array(instrument.harmonics.length);
                    
                for (var i = 0; i < instrument.harmonics.length; i++) {
                    real[i] = instrument.harmonics[i];
                }
                
                var waveform = audioCtx.createPeriodicWave(real, new Float32Array(instrument.harmonics.length));
                
                finalInstrument.waveform = waveform;
                
                return finalInstrument;
            }
        }
        
        return service;
    }
})();