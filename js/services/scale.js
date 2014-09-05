(function() {
    'use strict';
    
    angular.module('sequencer')
        .factory('scaleService', scaleService);
        
    /* @ngInject */
    function scaleService() {
        var scaleDefinitions = {
            minor: {
                name: 'Minor',
                intervals: [0, 2, 3, 5, 7, 8, 10, 12]
            },
            major: {
                name: 'Major',
                intervals: [0, 2, 4, 5, 7, 9, 11, 12]
            }
        };
        
        var notes = [
            {name: 'C', octave: 4, pianoKey: 40},
            {name: 'C#/Db', octave: 4, pianoKey: 41},
            {name: 'D', octave: 4, pianoKey: 42},
            {name: 'D#/Eb', octave: 4, pianoKey: 43},
            {name: 'E', octave: 4, pianoKey: 44},
            {name: 'F', octave: 4, pianoKey: 45},
            {name: 'F#/Gb', octave: 4, pianoKey: 46},
            {name: 'G', octave: 4, pianoKey: 47},
            {name: 'G#/Ab', octave: 4, pianoKey: 48},
            {name: 'A', octave: 4, pianoKey: 49},
            {name: 'A#/Bb', octave: 4, pianoKey: 50},
            {name: 'B', octave: 4, pianoKey: 51}
        ];
        
        var service = {
            getNotes: getNotes,
            getAvailableScales: getAvailableScales
        };
        
        return service;
        
        function getNotes(startNote, scaleKey, octaves) {
            var baseNote = notes.filter(function(note) {
                return note.name.split('/').reduce(function(prev, current) {
                    return startNote.name.toLowerCase() === current.toLowerCase() || prev;
                }, false);
            })[0];
            
            var octaveDifference = (startNote.octave || 4) - baseNote.octave,
                startPianoKey = baseNote.pianoKey + octaveDifference * 12,
                baseNoteIndex = notes.indexOf(baseNote);
                            
            var intervals = [];
            
            for (var i = 0; i < octaves; i++) {
                intervals = intervals.concat(scaleDefinitions[scaleKey].intervals.map(function(interval) {
                    return interval + 12 * i;
                }));
            }
            
            return intervals.filter(function(interval, index) {
                return intervals.indexOf(interval) === index;
            }).map(function(interval, index) {
                var noteName = notes[(baseNoteIndex + interval) % 12].name;
                
                return {
                    freq: Math.pow(2, (startPianoKey + interval - 49) / 12) * 440,
                    index: index,
                    name: noteName
                };
            });
        }
        
        function getAvailableScales() {
            return Object.keys(scaleDefinitions).map(function(scale) {
                return {
                    key: scale,
                    name: scaleDefinitions[scale].name
                };
            });
        }
    }
})();