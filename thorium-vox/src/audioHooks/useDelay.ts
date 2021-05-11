import React, { useContext } from "react";
import Delay from "soundbank-delay";
import { AContext } from "./useAudioContext";

export default function useDelay() {
  const audioContext = useContext(AContext);
  const [delay] = React.useState(Delay(audioContext));

  delay.time.value = 0.2; //seconds
  delay.wet.value = 0.8;
  delay.dry.value = 1;
  delay.cutoff.value = 400; //Hz
  delay.feedback.value = 0.6;

  return delay;
}
