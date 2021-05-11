import React from "react";

export const AContext = React.createContext({});

export default function ReactAudioContext({ children }) {
  const [audioContext] = React.useState(new AudioContext());

  return <AContext.Provider value={audioContext}>{children}</AContext.Provider>;
}
