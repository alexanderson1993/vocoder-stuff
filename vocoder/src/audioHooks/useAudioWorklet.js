import React from "react";
import { AContext } from "./useAudioContext";

export default function useAudioWorklet(scriptPath, processorName) {
  const audioContext = React.useContext(AContext);
  const [workletNode, setWorkletNode] = React.useState(null);

  React.useEffect(() => {
    audioContext.audioWorklet
      .addModule(scriptPath)
      .then(() => {
        const node = new AudioWorkletNode(audioContext, processorName);
        node.onprocessorerror = m => console.error(m);
        setWorkletNode(node);
      })
      .catch(err => console.log(err));
  }, [audioContext, scriptPath, processorName]);
  return workletNode;
}
