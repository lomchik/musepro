angular.module('midi')
    .service('MIDI', function() {
        MIDI.loadPlugin({
            soundfontUrl: '/soundfont/',
            instruments: [/*'synth_drum', 'steel_drums', */'melodic_tom'/*, 'taiko_drum'*/],
            onprogress: function (state, progress) {/*
                console.log('loading fonts ' + Math.round(progress * 100) + '%');*/
            },
            onsuccess: function () {/*
                console.log('fonts loaded')*/
            }
        });

        return MIDI;
    })
    .directive('midiPlayer', function() {

        return {
            scope: {
                input: '=',
                bpm: '='
            },
            templateUrl: '/app/midi/midi-player.html',
            controller: 'MidiPlayerController'
        };
    })
    .controller('MidiPlayerController', function($scope, MIDI) {
        $scope.options = {
            beatsPerMinute: MIDI.Player.BPM,
            repeat: false,
            finished: false,
            currentTime: 0,
            endTime: 0
        };
        $scope.player = MIDI.Player;
        $scope.updateChannels = function(instrument) {
            for (var i in MIDI.channels) {
                MIDI.channels[i].instrument = instrument;
            }
        };
        $scope.play = function() {
            $scope.options.finished = false;
            $scope.updateChannels(117);//melodic_tom
            MIDI.Player.resume();
        };
        $scope.replay = function() {
            $scope.stop();
            $scope.play();
        };
        $scope.pause = function() {
            MIDI.Player.pause();
        };
        $scope.stop = function() {
            MIDI.Player.stop();
        };
        $scope.loadFile = function(file, success) {
            if (!file) return;
            MIDI.Player.loadFile(file, function() {
                success && success();
                $scope.options.endTime = MIDI.Player.endTime;
            }, null,  function(e) {
                console.error(e)
            });
        };
        $scope.seek = function() {
            var playing = MIDI.Player.playing;
            $scope.pause();
            MIDI.Player.currentTime = $scope.options.currentTime;
            if (playing) {
                $scope.play();
            }
        };

        MIDI.Player.setAnimation(function(data) {
            if (data.now >= data.end) {
                $scope.stop();
                $scope.options.finished = true;
            }
            $scope.options.currentTime = MIDI.Player.currentTime;
            $scope.$digest();
        });
        MIDI.Player.addListener(function(data) { // set it to your own function!
            var now = data.now; // where we are now
            var end = data.end; // time when song ends
            var channel = data.channel; // channel note is playing on
            var message = data.message; // 128 is noteOff, 144 is noteOn
            var note = data.note; // the note
            var velocity = data.velocity; // the velocity of the note
            //console.log(data);
        });
        $scope.$watch('input', function(value) {
            $scope.options.fileData = value;
            $scope.loadFile($scope.options.fileData);
            $scope.play();
        });
        $scope.$watch('bpm', function(value) {
            MIDI.Player.BPM = value;
            var playing = MIDI.Player.playing;
            $scope.loadFile($scope.options.fileData, function() {
                playing && $scope.replay();
            });//reloadFile
        });
        $scope.$watch('options.fileData', function(value) {
            $scope.loadFile(value);
        });
        $scope.$watch('options.finished', function(value) {
            value && $scope.options.repeat && $scope.play();
        })
    });