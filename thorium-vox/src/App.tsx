import React, { useState } from "react";
import ReactAudioContext, { AContext } from "./audioHooks/useAudioContext";
import useMicrophone from "./audioHooks/useMicrophone";
import useReverb from "./audioHooks/useReverb";
import usePitchShift from "./audioHooks/usePitchShift";
import useGain from "./audioHooks/useGain";
import useConnectNodes from "./audioHooks/useConnectNodes";

const AudioApp = () => {
  const [pitch, setPitch] = useState(0);
  const microphone = useMicrophone();
  const reverb = useReverb();

  const gain = useGain();
  const pitchShift = usePitchShift({ transpose: pitch });
  const nodes = React.useMemo(
    () => [
      microphone,
      // reverb,
      pitchShift,
    ],

    [microphone, reverb, pitchShift]
  );
  const output = useConnectNodes(nodes);
  return (
    <input
      type="range"
      min={-12}
      max={12}
      step={0.1}
      value={pitch}
      onChange={(e) => setPitch(parseFloat(e.target.value))}
    />
  );
};

function App() {
  return (
    <ReactAudioContext>
      <div className="h-full bg-gray-900 flex flex-col items-center justify-center">
        <AudioApp />
      </div>
      ;
    </ReactAudioContext>
  );
}

export default App;
