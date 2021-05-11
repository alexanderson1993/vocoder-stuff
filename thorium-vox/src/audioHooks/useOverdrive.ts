import React, { useContext } from "react";
import Overdrive from "soundbank-overdrive";
import { AContext } from "./useAudioContext";

export default function useReverb() {
  const audioContext = useContext(AContext);
  const [overdrive] = React.useState(Overdrive(audioContext));

  overdrive.gain.value = 20;
  overdrive.preBand.value = 5000;
  overdrive.postCut.value = 600;

  return overdrive;
}
