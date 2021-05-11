import React from "react";
import Overdrive from "soundbank-overdrive";

export default function useReverb(audioContext) {
  const [overdrive] = React.useState(Overdrive(audioContext));

  overdrive.gain.value = 20;
  overdrive.preBand.value = 5000;
  overdrive.postCut.value = 600;

  return overdrive;
}
