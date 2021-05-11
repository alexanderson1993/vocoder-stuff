import React from "react";
import PitchShift from "soundbank-pitch-shift";
import { AContext } from "./useAudioContext";

export default function usePitchShift() {
  const audioContext = React.useContext(AContext);
  const [pitchShift] = React.useState(PitchShift(audioContext));

  pitchShift.transpose = 0;
  pitchShift.wet.value = 1;
  pitchShift.dry.value = 0;

  return pitchShift;
}
