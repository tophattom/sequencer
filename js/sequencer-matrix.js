(function() {
    'use strict';
    
    var SequencerMatrix = function(audioContext, destination, beatsPerPage) {
        this.audioContext = audioContext;
        
        this.audioCells = [];
        
        this.pages = 1;
        
        this.beatsPerPage = beatsPerPage;
        this.currentBeat = 0;
        
        this.volume = audioContext.createGain();
        this.volume.connect(destination);
        
        this.muted = false;
        this.lastVolume = this.volume.gain.value;
        
        this.waveType = 'sine';
        
        this.name = 'New matrix';
    };
    
    SequencerMatrix.prototype.addPage = function() {
        this.pages++;
    };
    
    SequencerMatrix.prototype.removePage = function() {
        if (this.pages === 1) {
            return;
        }
        
        this.pages--;
        
        this.audioCells.splice(this.pages * this.beatsPerPage, this.audioCells.length - this.beatsPerPage);
    };
    
    SequencerMatrix.prototype.clear = function() {
        this.audioCells = [];
    };
    
    SequencerMatrix.prototype.setWaveType = function(newWaveType) {
        this.waveType = newWaveType;
        
        this.audioCells.forEach(function(beat) {
            beat.forEach(function(cell) {
                cell.forEach(function(subCell) {
                    if (subCell !== null) {
                        subCell.osc.type = newWaveType;
                    }
                });
            });
        });
    };
    
    SequencerMatrix.prototype.setPageLength = function(newLength) {
        var oldTotalLength = this.pages * this.beatsPerPage,
            newTotalLength = this.pages * newLength;
            
        if (newTotalLength < oldTotalLength) {
            this.audioCells.splice(newTotalLength, oldTotalLength - newTotalLength);
        }
        
        this.beatsPerPage = newLength;
    };
    
    SequencerMatrix.prototype.getAudioCell = function(beat, note) {
        if (!this.audioCells[beat]) {
            return [null];
        }
        
        return this.audioCells[beat][note.index] ? this.audioCells[beat][note.index] : [null];
    };
    
    SequencerMatrix.prototype.toggleAudioCell = function(beat, note, subBeat) {
        subBeat = subBeat || 0;
        
        if (beat > this.pages * this.beatsPerPage - 1) {
            return;
        }
        
        if (!this.audioCells[beat]) {
            this.audioCells[beat] = [];
        }
        
        if (!this.audioCells[beat][note.index]) {
            this.audioCells[beat][note.index] = [];
        }
        
        if (!this.audioCells[beat][note.index][subBeat]) {
            var newCell = new AudioCell(this.audioContext, this.volume, note.freq, this.waveType);
            this.audioCells[beat][note.index][subBeat] = newCell;
        } else {
            this.audioCells[beat][note.index][subBeat] = null;
        }
    };
    
    SequencerMatrix.prototype.splitAudioCell = function(beat, note, parts) {
        if (!this.audioCells[beat]) {
            this.audioCells[beat] = [];
        }
        
        if (!this.audioCells[beat][note.index]) {
            this.audioCells[beat][note.index] = [];
        }
        
        var oldLength = this.audioCells[beat][note.index].length;
        
        if (parts < oldLength) {
            this.audioCells[beat][note.index].splice(parts, oldLength - parts);
        } else {
            for (var i = 0; i < parts - oldLength; i++) {
                this.audioCells[beat][note.index].push(null);
            }
        }
    };
    
    SequencerMatrix.prototype.update = function(beatDuration) {
        this.currentBeat = (this.currentBeat + 1) % (this.pages * this.beatsPerPage);
        
        this.playAudioCells(beatDuration);
    };
    
    SequencerMatrix.prototype.playAudioCells = function(beatDuration) {
        if (!this.audioCells[this.currentBeat]) {
            return;
        }
        
        this.audioCells[this.currentBeat].forEach(function(cell) {
            var subCells = cell.length,
                subBeatDuration = (beatDuration / subCells);
            
            cell.forEach(function(subCell, index) {
                if (subCell !== null) {
                    var startDelay = subBeatDuration * index;
                    
                    subCell.start(startDelay);
                    subCell.stop(startDelay + subBeatDuration * 0.9);
                }
            });
        });
    };
    
    SequencerMatrix.prototype.toggleMute = function () {
        this.muted = !this.muted;
        if (this.muted) {
            this.lastVolume = this.volume.gain.value;
            this.volume.gain.value = 0;
        } else {
            this.volume.gain.value = this.lastVolume;
        }
    };
    
    window.SequencerMatrix = SequencerMatrix;
})();