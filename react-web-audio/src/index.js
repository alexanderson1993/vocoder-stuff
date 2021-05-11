import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import ReactAudioContext, { AContext } from "./audioHooks/useAudioContext";
import useMicrophone from "./audioHooks/useMicrophone";
import useReverb from "./audioHooks/useReverb";
import usePitchShift from "./audioHooks/usePitchShift";
import useConnectNodes from "./audioHooks/useConnectNodes";
import useGain from "./audioHooks/useGain";
import useAudioWorklet from "./audioHooks/useAudioWorklet";
import fft from "fft-js";
console.log(fft);

function drawPath(canvas, canvasCtx, data, divider = 4) {
  canvasCtx.beginPath();
  let len = data.length;
  var sliceWidth = (canvas.width * 1.0) / len;
  var x = 0;
  // console.log((real[50] * canvas.height) / -2 + canvas.height / 2)

  for (var i = 0; i < len; i++) {
    var v = data[i] / 4;
    var y = (v * canvas.height) / -2 + canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

function AudioApp() {
  const microphone = useMicrophone();
  // const reverb = useReverb();

  // const gain = useGain();
  // const pitchShift = usePitchShift();
  const worklet = useAudioWorklet("phase-vocoder.js", "phase-vocoder");
  const nodes = React.useMemo(
    () => [
      microphone,
      worklet
      // reverb,
      // pitchShift
    ],

    [
      microphone,
      worklet
      // reverb,
      // pitchShift
    ]
  );
  const output = useConnectNodes(nodes);
  const canvasRef = React.useRef();

  const audioContext = React.useContext(AContext);
  React.useEffect(() => {
      if (worklet) worklet.port.onmessage = m => console.log(JSON.parse(m.data));
  },[worklet])
  // React.useEffect(() => {
  //   const analyser = audioContext.createAnalyser();
  //   output.connect(analyser);
  //   analyser.fftSize = 2048;
  //   const bufferLength = analyser.frequencyBinCount;
  //   var dataArray = new Uint8Array(bufferLength);
  //   analyser.getByteFrequencyData(dataArray);

  //   if (canvasRef.current) {
  //     const canvas = canvasRef.current;
  //     const canvasCtx = canvasRef.current.getContext("2d");
  //     if (worklet) worklet.port.onmessage = m => draw(JSON.parse(m.data));
  //     let count = 0;
  //     function draw({ sampleRate, fftOutput }) {
  //       //requestAnimationFrame(draw);
  //       canvasCtx.fillStyle = "rgb(200, 200, 200)";
  //       canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  //       canvasCtx.lineWidth = 2;
  //       canvasCtx.strokeStyle = "rgb(255, 0, 0)";
  //       drawPath(canvas, canvasCtx, fftOutput.map(m => m[0]));

  //       canvasCtx.strokeStyle = "rgba(0, 0, 255, 0.5)";
  //       drawPath(canvas, canvasCtx, fftOutput.map(m => m[1]));

  //       canvasCtx.strokeStyle = "rgba(0, 255, 0, 0.5)";
  //       if (count === 1000) {
  //         console.log(fft.util.fftFreq(fftOutput, sampleRate))
  //       }
  //       drawPath(
  //         canvas,
  //         canvasCtx,
  //         fft.util.fftFreq(fftOutput, sampleRate)
  //       );
  //       count++;
  //     }

  //   }
  // }, [audioContext, output, worklet]);
  return <canvas ref={canvasRef} />;
}

function App() {
  return (
    <ReactAudioContext>
      <div className="App">
        <AudioApp />
        <h1>Hello CodeSandbox</h1>
        <h2>Start editing to see some magic happen!</h2>
      </div>
    </ReactAudioContext>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
