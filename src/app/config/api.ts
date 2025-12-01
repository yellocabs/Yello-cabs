import { NativeModules } from "react-native";

const { scriptURL } = NativeModules.SourceCode;

// Automatically take host from Metro server (works on device + emulator)
let host = "localhost";

if (scriptURL) {
  host = scriptURL.split("://")[1].split(":")[0];
}

export const BASE_URL = `http://${host}:9876`;
