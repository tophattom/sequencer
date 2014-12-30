(function() {
    'use strict';
    
    var AudioCell = function(ctx, destination, frequency, instrument) {
        this.audioCtx = ctx;
        
        this.osc = ctx.createOscillator();
        this.gain = ctx.createGain();
        
        this.osc.frequency.value = frequency;
        this.osc.connect(this.gain);
        
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
        var that = this;
        setTimeout(function() {
            that.gain.gain.value = 1.0;
        }, delay * 1000);
    };
    
    AudioCell.prototype.stop = function(delay) {
        var that = this;
        setTimeout(function() {
            that.gain.gain.value = 0.0;
        }, delay * 1000);
    };
    
    window.AudioCell = AudioCell;
})();