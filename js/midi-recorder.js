var MidiRecorder = function(input, dataTarget) {
    this._input = input;
    if (dataTarget instanceof  Array) {
        this._events = dataTarget;
    }
    else {
        this._events = [];
    }
    this.status = 'inited';
    this._midiMessageReceiver = this._midiMessageReceiver.bind(this);
};

MidiRecorder.prototype = {
    record: function() {
        this._input.onmidimessage = this._midiMessageReceiver;
        this.status = 'recording';
    },
    pause: function() {
        this._input.onmidimessage = null;
        this.status = 'pause';
    },
    clear: function() {
        this._events.length = 0;
    },
    input: function(input) {
        if (input) {
            this._input = input;
        }
        return this._input;
    },
    data: function() {
        return this._events;
    },
    midi: function(bpm) {
        var file = new Midi.File(),
            track = new Midi.Track(),
            tickLength = (60000 / bpm / 128),
            lastEventTime = 0;

        file.addTrack(track);
        bpm && track.setTempo(bpm);
        this._events.forEach(function(event) {
            lastEventTime = lastEventTime || (event.receivedTime - 500);
            var human = humanizeMidiMessage(event),
                ticks = (event.receivedTime - lastEventTime) / tickLength;

            lastEventTime = event.receivedTime;
            console.log(ticks);
            if (human.type == 'Note On') {
                track.addNoteOn(10, human.note, ticks, event.velocity);
            }
            else {
                track.addNoteOff(10, human.note, ticks, event.velocity)
            }
        });

        return 'base64,' + btoa(file.toBytes());
    },
    _midiMessageReceiver: function(event) {
        this._events.push(event);
    }
};