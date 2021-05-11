import React, { useEffect } from "react";
import PitchShift from "soundbank-pitch-shift";
import { AContext } from "./useAudioContext";

export default function usePitchShift({
  transpose = 0,
  wet = 1,
  dry = 0,
} = {}) {
  const audioContext = React.useContext(AContext);
  const [pitchShift] = React.useState(PitchShift(audioContext));

  useEffect(() => {
    pitchShift.transpose = transpose;
    pitchShift.wet.value = wet;
    pitchShift.dry.value = dry;
  }, [transpose, wet, dry, pitchShift]);

  return pitchShift;
}
