(function() {
    'use strict';
    
    var AudioCell = function(ctx, destination, frequency, waveType, onended) {
        this.audioCtx = ctx;
        
        this.osc = ctx.createOscillator();
        this.gain = ctx.createGain();
        
        this.osc.frequency.value = frequency;
        this.osc.type = waveType || 'sine';
        this.osc.connect(this.gain);
        
        this.gain.gain.value = 0.0;
        this.gain.connect(destination);
        
        this.frequency = frequency;
        
        this.onended = onended;
        
        this.osc.start();
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
            
            if (that.onended) {
                that.onended();
            }
        }, delay * 1000);
    };
    
    window.AudioCell = AudioCell;
})();