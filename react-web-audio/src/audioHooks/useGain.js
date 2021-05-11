import React from "react";
import { AContext } from "./useAudioContext";

export default function useGain() {
  const audioContext = React.useContext(AContext);
  const [gain] = React.useState(new GainNode(audioContext));

  return gain;
}
