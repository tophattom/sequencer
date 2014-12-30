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
                release: 0
            },
            sawtooth: {
                waveType: 'sawtooth',
                name: 'Sawtooth wave',
                attack: 0,
                release: 0
            },
            square: {
                waveType: 'square',
                name: 'Square wave',
                attack: 0,
                release: 0
            },
            triangle: {
                waveType: 'triangle',
                name: 'Triangle wave',
                attack: 0,
                release: 0
            },
            xylosynth: {
                name: 'Xylosynth',
                waveType: 'custom',
                harmonics: [0, 1, 0.3, 0.1, 0.3, 0.1, 0.3],
                attack: 0.015,
                release: 0.2
            }
        };
        
        var service = {
            getAvailableInstuments: getAvailableInstuments,
            getInstrument: getInstrument
        };
        
        function getAvailableInstuments() {
            return Object.keys(instruments).map(function(instrumentKey) {
                return {
                    instrumentKey: instrumentKey,
                    name: instruments[instrumentKey]
                };
            });
        }
        
        function getInstrument(instrumentKey, audioCtx) {
            var instrument = instruments[instrumentKey];
            
            if (instrument.waveType !== 'custom') {
                return angular.copy(instrument);
            } else {
                var real = new Float32Array(instrument.harmonics.length);
                    
                for (var i = 0; i < instrument.harmonics.length; i++) {
                    real[i] = instrument.harmonics[i];
                }
                
                var waveform = audioCtx.createPeriodicWave(real, new Float32Array(instrument.harmonics.length)),
                    finalInstrument = angular.copy(instrument);
                
                finalInstrument.waveform = waveform;
                
                return finalInstrument;
            }
        }
        
        return service;
    }
})();