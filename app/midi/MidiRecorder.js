angular.module('midi', []);

angular.module('midi')
    .factory('Devices', function($window) {
        function _connect() {
            if($window.navigator && 'function' === typeof $window.navigator.requestMIDIAccess) {
                return $window.navigator.requestMIDIAccess();
            } else {
                throw 'No Web MIDI support';
            }
        }

        return {
            connect: _connect
        };
    })
    .directive('midiRecorder', function() {
        return {
            scope: {
                output: '=',
                bpm: '='
            },
            templateUrl: '/app/midi/midi-recorder.html',
            controller: function($scope, Devices, ngMidiRecorder) {
                $scope.devices = [];
                $scope.selectedInput;
                $scope.selectedInputId;
                $scope.midiRecorder = new ngMidiRecorder($scope.selectedInput);

                $scope.parseEvents = function(data) {
                    var event, events=[], parser;
                    parser=new MIDIEvents.createParser(
                        new DataView(data),
                        0, false);
                    event=parser.next();
                    do {
                        events.push(event);
                        event=parser.next();
                    } while(event);

                    return events;
                };

                $scope.stopRecording = function() {
                    $scope.output = angular.copy($scope.midiRecorder.midi($scope.bpm));
                    $scope.midiRecorder.pause();
                    $scope.midiRecorder.clear();
                };


                Devices.connect()
                    .then(function(access) {
                        if(access.inputs && access.inputs.size > 0) {
                            var inputs = access.inputs.values(),
                                input = null;

                            // iterate through the devices
                            for (input = inputs.next(); input && !input.done; input = inputs.next()) {
                                $scope.devices.push(input.value);
                            }
                            console.log($scope.devices);
                            $scope.selectedInputId = $scope.devices[0].id;
                        } else {
                            alert('No devices detected!');
                        }
                    })
                    .catch(function(e) {
                        alert(e);
                    });
                $scope.$watch('selectedInput', function(input) {
                    if (input) {
                        $scope.midiRecorder.input($scope.selectedInput);
                    }
                });
                $scope.$watch('selectedInputId', function(id) {
                    $scope.devices.forEach(function(device) {
                       if (device.id == id) {
                           $scope.selectedInput = device;
                       }
                    });
                });
            }
        };
    });