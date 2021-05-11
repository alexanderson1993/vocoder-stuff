import React from "react";
import { AContext } from "./useAudioContext";

export default function useConnectNodes(nodes: AudioNode[]) {
  const audioContext = React.useContext(AContext);
  const outputRef = React.useRef(new GainNode(audioContext));
  outputRef.current.connect(audioContext.destination);
  React.useEffect(() => {
    // If any of the nodes are falsey, bail.
    if (nodes.find((n) => !n)) return;
    for (let i = 1; i < nodes.length; i++) {
      if (!nodes[i - 1] || !nodes[i]) return;
      nodes[i - 1].connect(nodes[i]);
    }
    if (!nodes[nodes.length - 1]) return;
    nodes[nodes.length - 1].connect(outputRef.current);
    return () => {
      nodes.forEach((node) => node?.disconnect());
    };
  }, [nodes]);
  return outputRef.current;
}
