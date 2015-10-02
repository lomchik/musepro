angular.module('ngMidiRecorder', [])
.factory('ngMidiRecorder', function() {
   return function(input, dataTarget, options) {
       return new MidiRecorder(input, dataTarget, options);
   }
});