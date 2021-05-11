import React from "react";
import { AContext } from "./useAudioContext";

export default function useConnectNodes(nodes) {
  const audioContext = React.useContext(AContext);
  const outputRef = React.useRef(new GainNode(audioContext));
  outputRef.current.connect(audioContext.destination);

  React.useEffect(() => {
    // If any of the nodes are falsey, bail.
    if (nodes.find(n => !n)) return;
    for (let i = 1; i < nodes.length; i++) {
      if (!nodes[i - 1] || !nodes[i]) return;
      nodes[i - 1].connect(nodes[i]);
    }
    nodes[nodes.length - 1].connect(outputRef.current);
  }, [nodes]);
  return outputRef.current;
}
