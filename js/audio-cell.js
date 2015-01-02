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
            this.osc.type = instrument.waveType;
            
            if (instrument.waveType === 'custom') {
                this.osc.setPeriodicWave(instrument.waveform);
            }
        }
        
        this.gain.gain.value = 0.0;
        this.gain.connect(destination);
        
        this.frequency = frequency;
        
        this.osc.start();
        
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
        
        if (this.instrument.attack === 0) {
            gain.linearRampToValueAtTime(1, startTime + 0.001);
            // gain.setValueAtTime(1, startTime);
        } else {
            gain.linearRampToValueAtTime(1, startTime + this.instrument.attack);
        }
    };
    
    AudioCell.prototype.stop = function(currentTime, delay) {
        var gain = this.gain.gain,
            startTime = currentTime + delay;
            
        var diff = startTime - this.lastHit,
            currentValue = Math.min(1, diff / this.instrument.attack);
        
        gain.setValueAtTime(currentValue, startTime);
        
        if (this.instrument.release === 0) {
            gain.linearRampToValueAtTime(0, startTime + 0.001);
        } else {
            gain.linearRampToValueAtTime(0, startTime + this.instrument.release);
        }
    };
    
    window.AudioCell = AudioCell;
})();