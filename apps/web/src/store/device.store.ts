import { create } from 'zustand';

interface DeviceState {
  hasCameraPermission: boolean;
  hasMicPermission: boolean;
  isFaceDetected: boolean;
  micLevel: number;
  speakerTested: boolean;
  micSentenceHeard: boolean;
  isChecking: boolean;
  statusMessage: string;
  setCameraPermission: (val: boolean) => void;
  setMicPermission: (val: boolean) => void;
  setFaceDetected: (val: boolean) => void;
  setMicLevel: (level: number) => void;
  setSpeakerTested: (val: boolean) => void;
  setMicSentenceHeard: (val: boolean) => void;
  setStatusMessage: (val: string) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  hasCameraPermission: false,
  hasMicPermission: false,
  isFaceDetected: false,
  micLevel: 0,
  speakerTested: false,
  micSentenceHeard: false,
  isChecking: false,
  statusMessage: 'Allow camera and microphone to begin the same checks you’d do before a real video interview.',

  setCameraPermission: (val) => set({ hasCameraPermission: val }),
  setMicPermission: (val) => set({ hasMicPermission: val }),
  setFaceDetected: (val) => set({ isFaceDetected: val }),
  setMicLevel: (level) => set({ micLevel: level }),
  setSpeakerTested: (val) => set({ speakerTested: val }),
  setMicSentenceHeard: (val) => set({ micSentenceHeard: val }),
  setStatusMessage: (val) => set({ statusMessage: val }),
}));
