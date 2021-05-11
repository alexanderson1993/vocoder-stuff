import React from "react";
import Delay from "soundbank-delay";

export default function useDelay(audioContext) {
  const [delay] = React.useState(Delay(audioContext));

  delay.time.value = 0.2; //seconds
  delay.wet.value = 0.8;
  delay.dry.value = 1;
  delay.cutoff.value = 400; //Hz
  delay.feedback.value = 0.6;

  return delay;
}
