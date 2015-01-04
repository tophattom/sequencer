(function() {
    'use strict';
    
    var AudioCell = function(ctx, destination, frequency, instrument) {
        this.audioCtx = ctx;
        
        this.osc = ctx.createOscillator();
        this.gain = ctx.createGain();
        
        this.osc.frequency.value = frequency;
        this.osc.connect(this.gain);
        
        this.instrument = instrument;
        
        if (instrument) {
            if (instrument.waveType === 'custom') {
                this.osc.setPeriodicWave(instrument.waveform);
            } else {
                this.osc.type = instrument.waveType;
            }
        }
        
        this.gain.gain.value = 0.0;
        this.gain.connect(destination);
        
        this.frequency = frequency;
        
        this.osc.start(0);
        
        this.lastHit = 0;
    };
    
    AudioCell.prototype.setInstrument = function (instrument) {
        this.instrument = instrument;
        this.osc.type = instrument.waveType;
        
        if (instrument.waveType === 'custom') {
            this.osc.setPeriodicWave(instrument.waveform);
        }
    };
    
    AudioCell.prototype.start = function(currentTime, delay) {
        var gain = this.gain.gain,
            startTime = currentTime + delay;
            
        this.lastHit = startTime;
            
        gain.cancelScheduledValues(startTime);
        gain.setValueAtTime(0, startTime);
        
        var attack = Math.max(0.001, this.instrument.attack),
            decay = Math.max(0.001, this.instrument.decay);
            
        gain.linearRampToValueAtTime(1, startTime + attack);
        gain.linearRampToValueAtTime(this.instrument.sustain, startTime + attack + decay);
    };
    
    AudioCell.prototype.stop = function(currentTime, delay) {
        var gain = this.gain.gain,
            startTime = currentTime + delay;
        
        gain.setValueAtTime(this.instrument.sustain, startTime);
        gain.linearRampToValueAtTime(0, startTime + Math.max(0.001, this.instrument.release));
    };
    
    window.AudioCell = AudioCell;
})();