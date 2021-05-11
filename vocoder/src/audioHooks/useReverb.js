import React from "react";
import Reverb from "soundbank-reverb";
import { AContext } from "./useAudioContext";

export default function useReverb() {
  const audioContext = React.useContext(AContext);
  const [reverb] = React.useState(Reverb(audioContext));

  reverb.time = 3; //seconds
  reverb.wet.value = 0.8;
  reverb.dry.value = 1;

  reverb.filterType = "highpass";
  reverb.cutoff.value = 2000; //Hz

  return reverb;
}
