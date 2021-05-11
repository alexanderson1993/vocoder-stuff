import React from "react";
import { AContext } from "./useAudioContext";

export default function useMicrophone() {
  const [mediaDevice, setMediaDevice] =
    React.useState<MediaStreamAudioSourceNode>(null!);
  const audioContext = React.useContext(AContext);

  React.useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported.");
      navigator.mediaDevices
        .getUserMedia(
          // constraints - only audio needed for this app
          {
            audio: true,
          }
        )

        // Success callback
        .then(function (stream) {
          let options = {
            mediaStream: stream,
          };

          let source = new MediaStreamAudioSourceNode(audioContext, options);
          setMediaDevice(source);
        })

        // Error callback
        .catch(function (err) {
          console.log("The following getUserMedia error occured: " + err);
        });
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }, [audioContext]);
  return mediaDevice;
}
