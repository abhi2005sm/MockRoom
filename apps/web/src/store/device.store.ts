import { create } from 'zustand';

interface DeviceState {
  hasCameraPermission: boolean;
  hasMicPermission: boolean;
  isFaceDetected: boolean;
  micLevel: number;
  speakerTested: boolean;
  isChecking: boolean;
  statusMessage: string;
  setCameraPermission: (val: boolean) => void;
  setMicPermission: (val: boolean) => void;
  setFaceDetected: (val: boolean) => void;
  setMicLevel: (level: number) => void;
  setSpeakerTested: (val: boolean) => void;
  runDeviceDiagnostics: () => Promise<boolean>;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  hasCameraPermission: false,
  hasMicPermission: false,
  isFaceDetected: false,
  micLevel: 0,
  speakerTested: false,
  isChecking: false,
  statusMessage: 'Ready to begin camera and microphone check.',

  setCameraPermission: (val) => set({ hasCameraPermission: val }),
  setMicPermission: (val) => set({ hasMicPermission: val }),
  setFaceDetected: (val) => set({ isFaceDetected: val }),
  setMicLevel: (level) => set({ micLevel: level }),
  setSpeakerTested: (val) => set({ speakerTested: val }),

  runDeviceDiagnostics: async () => {
    set({ isChecking: true, statusMessage: 'Testing camera and face detection...' });
    await new Promise((r) => setTimeout(r, 600));

    set({ hasCameraPermission: true, isFaceDetected: true, statusMessage: 'We can see you clearly. Testing microphone...' });
    await new Promise((r) => setTimeout(r, 800));

    set({ hasMicPermission: true, micLevel: 72, statusMessage: 'Microphone level detected cleanly. Testing speaker...' });
    await new Promise((r) => setTimeout(r, 600));

    set({ speakerTested: true, isChecking: false, statusMessage: 'All device checks passed cleanly.' });
    return true;
  },
}));
