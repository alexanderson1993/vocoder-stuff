navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

var audioContext = new AudioContext();

var concertHallBuffer;
var bufferSize = 1024;

ajaxRequest = new XMLHttpRequest();
ajaxRequest.open("GET", "irHall.ogg", true);
ajaxRequest.responseType = "arraybuffer";

ajaxRequest.onload = function () {
  var audioData = ajaxRequest.response;
  audioContext.decodeAudioData(
    audioData,
    function (buffer) {
      concertHallBuffer = buffer;
    },
    function (e) {
      "Error with decoding audio data" + e.err;
    }
  );
};

ajaxRequest.send();
throw new Error(0);
navigator.getUserMedia(
  {
    audio: true,
    video: false,
  },

  // Success callback

  /*
source 	->	dryMix -> masterMix -> output
->	pitchShifter -> reverbCounterGain -> formantNode -> wetMix
 -> reverbGain -> reverbNode -> formantNode -> wetMix -> masterMix -> output
*/

  function (stream) {
    var source = audioContext.createMediaStreamSource(stream);

    var pitchShifter = new Jungle(audioContext);
    pitchShifter.setPitchOffset(0);

    var reverbNode = audioContext.createConvolver();
    reverbNode.buffer = concertHallBuffer;

    var reverbGain = audioContext.createGain();
    var reverbCounterGain = audioContext.createGain();

    // var formantNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
    // var formantLevel = 1.0;
    // var formantSampler = new Resampler(audioContext.sampleRate * formantLevel, audioContext.sampleRate, 1, bufferSize, false);

    var dft = new DFT(bufferSize, audioContext.sampleRate);
    var fft = new FFT(bufferSize, audioContext.sampleRate);

    var ping = true;

    var real = new Float32Array(bufferSize),
      imag = new Float32Array(bufferSize),
      newBuffer = new Float32Array(bufferSize);

    /*
formantNode.onaudioprocess = function(audioProcessingEvent) {
var inputBuffer = audioProcessingEvent.inputBuffer;

// The output buffer contains the samples that will be modified and played
var outputBuffer = audioProcessingEvent.outputBuffer;

var realStretchBuffer, imagStretchBuffer;

// Loop through the output channels (in this case there is only one)
for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
var inputData = inputBuffer.getChannelData(channel);
var outputData = outputBuffer.getChannelData(channel);

if (formantLevel !== 1) {

dft.forward(inputData);

// Shift the formant on the real and imaginary values
realStretchBuffer = new Float32Array(dft.bufferSize * formantLevel);
imagStretchBuffer = new Float32Array(dft.bufferSize * formantLevel);
var newIndex = 0, lastIndex = 0;

// Logarithmic resampling
for (var sample = 0; sample < dft.bufferSize; sample++) {
// Step 1: Take the sample and place it into a new array at the position it should be in

// This math calculates the stretched position of this array index
// newIndex = oldIndex^(Log(Stretch Factor * startingBufferSize) / Log(startingBufferSize))
// This will scale the time domain by the stretch factor, keeping low indices close to original space
// while factors up the spectrum stretch accordingly
newIndex = Math.round(Math.pow(sample, Math.log(formantLevel * dft.bufferSize)/Math.log(dft.bufferSize)), 1);
realStretchBuffer[newIndex] = dft.real[sample];
imagStretchBuffer[newIndex] = dft.real[sample];

// Step 2: For the gap between the new index and the original index, calculate the steps between them
for (var diffStep = lastIndex; diffStep < newIndex; diffStep++) {
realStretchBuffer[diffStep] = realStretchBuffer[lastIndex] + (newIndex - diffStep) * (realStretchBuffer[newIndex] - realStretchBuffer[lastIndex]) / (newIndex - lastIndex);
imagStretchBuffer[diffStep] = imagStretchBuffer[lastIndex] + (newIndex - diffStep) * (imagStretchBuffer[newIndex] - imagStretchBuffer[lastIndex]) / (newIndex - lastIndex);
}

lastIndex = newIndex;
}

// Step 3: Re-sample to the original window size using a linear transform
real = formantSampler.resampler(realStretchBuffer);
imag = formantSampler.resampler(imagStretchBuffer);

newBuffer = fft.inverse(real, imag);
} else {
newBuffer = inputData;
}

for (var sample = 0; sample < newBuffer.length; sample++) {
outputData[sample] = newBuffer[sample];
}
}
};
*/

    var wetMix = audioContext.createGain();
    var dryMix = audioContext.createGain();
    var masterMix = audioContext.createGain();

    var analyser = audioContext.createAnalyser();

    wetMix.connect(masterMix);
    dryMix.connect(masterMix);

    source.connect(pitchShifter.input);
    source.connect(dryMix);

    pitchShifter.output.connect(reverbCounterGain);
    pitchShifter.output.connect(reverbGain);

    reverbCounterGain.connect(wetMix);
    reverbGain.connect(reverbNode);

    reverbNode.connect(wetMix);

    wetMix.connect(masterMix);

    var oscillator = audioContext.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 440;
    oscillator.start();

    pitchShifter.setPitchOffset(0);
    reverbGain.gain.value = 0;
    reverbCounterGain.gain.value = 1;
    wetMix.gain.value = 1;
    dryMix.gain.value = 0;
    masterMix.gain.value = 1;

    masterMix.connect(audioContext.destination);
    masterMix.connect(analyser);

    document
      .querySelector('input[name="pitch"]')
      .addEventListener("input", function () {
        document.querySelector("span.pitch").innerHTML = this.value;
        pitchShifter.setPitchOffset(this.value);
      });
    document
      .querySelector('input[name="formant"]')
      .addEventListener("input", function () {
        document.querySelector("span.formant").innerHTML = this.value;
        // formantLevel = this.value;
        //    formantSampler = new Resampler(audioContext.sampleRate * formantLevel, audioContext.sampleRate, 1, bufferSize, false);
      });
    document
      .querySelector('input[name="reverb"]')
      .addEventListener("input", function () {
        document.querySelector("span.reverb").innerHTML = this.value;
        reverbGain.gain.value = this.value;
        reverbCounterGain.gain.value = 1 - this.value;
      });
    document
      .querySelector('input[name="effect"]')
      .addEventListener("input", function () {
        document.querySelector("span.effect").innerHTML = this.value;
        wetMix.gain.value = this.value;
        dryMix.gain.value = 1 - this.value;
      });
    document
      .querySelector('input[name="volume"]')
      .addEventListener("input", function () {
        document.querySelector("span.volume").innerHTML = this.value;
        masterMix.gain.value = this.value;
      });

    // draw an oscilloscope of the current audio source

    var WIDTH = 640;
    var HEIGHT = 360;

    // Interesting parameters to tweak!
    var SMOOTHING = 0.8;
    var FFT_SIZE = 2048;

    analyser.minDecibels = -140;
    analyser.maxDecibels = 0;
    const freqs = new Uint8Array(analyser.frequencyBinCount);
    const times = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      analyser.smoothingTimeConstant = SMOOTHING;
      analyser.fftSize = FFT_SIZE;

      // Get the frequency data from the currently playing music
      analyser.getByteFrequencyData(freqs);
      analyser.getByteTimeDomainData(times);

      var width = Math.floor(1 / freqs.length, 10);

      var canvas = document.querySelector("canvas");
      var drawContext = canvas.getContext("2d");
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      // Draw the frequency domain chart.
      for (var i = 0; i < analyser.frequencyBinCount; i++) {
        var value = freqs[i];
        var percent = value / 256;
        var height = HEIGHT * percent;
        var offset = HEIGHT - height - 1;
        var barWidth = WIDTH / analyser.frequencyBinCount;
        var hue = (i / analyser.frequencyBinCount) * 360;
        drawContext.fillStyle = "hsl(" + hue + ", 100%, 50%)";
        drawContext.fillRect(i * barWidth, offset, barWidth, height);
      }

      // Draw the time domain chart.
      for (var i = 0; i < analyser.frequencyBinCount; i++) {
        var value = times[i];
        var percent = value / 256;
        var height = HEIGHT * percent;
        var offset = HEIGHT - height - 1;
        var barWidth = WIDTH / analyser.frequencyBinCount;
        drawContext.fillStyle = "white";
        drawContext.fillRect(i * barWidth, offset, 1, 2);
      }

      requestAnimationFrame(draw);
    }

    draw();
  },
  function (err) {
    console.log("error" + err);
  }
);
