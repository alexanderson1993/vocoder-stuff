import React, { useReducer } from "react";
import "./jungle";
import "./App.css";

interface VocoderConfig {
  bypass: boolean;
  pitch: number;
  formant: number;
  reverb: number;
  effect: number;
  volume: number;
  robot: boolean;
}

type VocoderActions =
  | { type: "setBypass"; bypass: boolean }
  | { type: "setPitch"; pitch: number }
  | { type: "setFormant"; formant: number }
  | { type: "setReverb"; reverb: number }
  | { type: "setEffect"; effect: number }
  | { type: "setVolume"; volume: number }
  | { type: "setRobot"; robot: boolean };

function vocoderReducer(
  state: VocoderConfig,
  action: VocoderActions
): VocoderConfig {
  switch (action.type) {
    case "setPitch":
      return { ...state, pitch: action.pitch };
    case "setBypass":
      return { ...state, bypass: action.bypass };
    case "setFormant":
      return { ...state, formant: action.formant };
    case "setReverb":
      return { ...state, reverb: action.reverb };
    case "setEffect":
      return { ...state, effect: action.effect };
    case "setVolume":
      return { ...state, volume: action.volume };
    case "setRobot":
      return { ...state, robot: action.robot };
  }
  return state;
}
function App() {
  const [config, dispatch] = useReducer(vocoderReducer, {
    bypass: false,
    pitch: 0,
    formant: 0,
    reverb: 0,
    effect: 1,
    volume: 1,
    robot: false,
  });

  return (
    <div className="App bg-gray-900 text-white text-2xl flex flex-col justify-center items-center">
      <div className="grid gap-2 grid-cols-3 items-center">
        <datalist id="my-detents">
          <option value="0" />
        </datalist>
        <label htmlFor="pitch">Pitch:</label>
        <input
          className="rounded-lg overflow-hidden appearance-none bg-gray-400 w-128"
          list="my-detents"
          type="range"
          name="pitch"
          min="-1"
          max="1"
          step="0.05"
          value={config.pitch}
          id="pitch"
          onInput={(e) =>
            dispatch({
              type: "setPitch",
              pitch: parseFloat(e.currentTarget.value),
            })
          }
        />
        <span className="pitch">({config.pitch})</span>
        <label htmlFor="formant">Formant:</label>
        <input
          className="rounded-lg overflow-hidden appearance-none bg-gray-400  w-128"
          disabled
          list="my-detents"
          type="range"
          name="formant"
          min="0.05"
          max="2"
          step="0.05"
          value={config.formant}
          id="formant"
          onInput={(e) =>
            dispatch({
              type: "setFormant",
              formant: parseFloat(e.currentTarget.value),
            })
          }
        />
        <span className="formant">({config.formant})</span>
        <label htmlFor="reverb">Reverb:</label>
        <input
          className="rounded-lg overflow-hidden appearance-none bg-gray-400  w-128"
          type="range"
          name="reverb"
          min="0"
          max="1"
          step="0.05"
          value={config.reverb}
          id="reverb"
          onInput={(e) =>
            dispatch({
              type: "setReverb",
              reverb: parseFloat(e.currentTarget.value),
            })
          }
        />
        <span className="reverb">({config.reverb})</span>
        <label htmlFor="effect">Effect:</label>
        <input
          className="rounded-lg overflow-hidden appearance-none bg-gray-400 w-128"
          type="range"
          name="effect"
          min="0"
          max="1"
          step="0.05"
          value={config.effect}
          id="effect"
          onInput={(e) =>
            dispatch({
              type: "setEffect",
              effect: parseFloat(e.currentTarget.value),
            })
          }
        />
        <span className="effect">({config.effect})</span>
        <label htmlFor="volume">Volume:</label>
        <input
          className="rounded-lg overflow-hidden appearance-none bg-gray-400 w-128"
          type="range"
          name="volume"
          min="0"
          max="1"
          step="0.05"
          value={config.volume}
          id="volume"
          onInput={(e) =>
            dispatch({
              type: "setVolume",
              volume: parseFloat(e.currentTarget.value),
            })
          }
        />
        <span className="volume">({config.volume})</span>
        <button
          onClick={() =>
            dispatch({ type: "setBypass", bypass: !config.bypass })
          }
          className="flex justify-center items-center col-start-2 text-center bg-blue-800 px-2 py-1 rounded hover:bg-blue-600 border-blue-700 border-2"
        >
          <div
            className={`rounded-full ${
              config.bypass ? `bg-red-500` : ""
            } h-3 w-3 mr-2 shadow-lg`}
          ></div>
          Bypass
          <div className="w-3 ml-2"></div>
        </button>
      </div>
      <canvas className="mt-8 border-white border-opacity-10 border-2"></canvas>
    </div>
  );
}

export default App;
