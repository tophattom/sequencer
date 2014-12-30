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
    };
    
    AudioCell.prototype.setInstrument = function (instrument) {
        this.osc.type = instrument.waveType;
        
        if (instrument.waveType === 'custom') {
            this.osc.setPeriodicWave(instrument.waveform);
        }
    };
    
    AudioCell.prototype.start = function(delay) {
        var that = this,
            gain = this.gain.gain;
            
        setTimeout(function() {
            var now = that.audioCtx.currentTime;
            
            if (that.instrument.attack === 0) {
                gain.value = 1;
            } else {
                gain.cancelScheduledValues(now);
                gain.setValueAtTime(0, now);
                gain.linearRampToValueAtTime(1, now + that.instrument.attack);
            }
        }, delay * 1000);
    };
    
    AudioCell.prototype.stop = function(delay) {
        var that = this,
            gain = this.gain.gain;
            
        setTimeout(function() {
            var now = that.audioCtx.currentTime;
            
            if (that.instrument.release === 0) {
                gain.value = 0;
            } else {
                gain.cancelScheduledValues(now);
                gain.setValueAtTime(gain.value, now);
                gain.linearRampToValueAtTime(0, now + that.instrument.release);
            }
        }, delay * 1000);
    };
    
    window.AudioCell = AudioCell;
})();