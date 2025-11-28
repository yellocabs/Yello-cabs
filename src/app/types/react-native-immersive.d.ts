declare module 'react-native-immersive' {
  const Immersive: {
    on: () => void;
    off: () => void;
    setImmersive: (enabled: boolean) => void;
  };
  export default Immersive;
}
