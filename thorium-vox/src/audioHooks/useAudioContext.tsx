import React from "react";

export const AContext = React.createContext(new AudioContext());

export default function ReactAudioContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [audioContext] = React.useState(new AudioContext());

  return <AContext.Provider value={audioContext}>{children}</AContext.Provider>;
}
