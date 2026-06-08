import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "MyChoice",
  slug: "mychoice-alpha001",
  scheme: "mychoice",
  version: "0.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  plugins: ["expo-router", "expo-secure-store"],
  experiments: { typedRoutes: true },
  ios: { supportsTablet: true, bundleIdentifier: "ai.egogentix.mychoice.alpha" },
  android: { package: "ai.egogentix.mychoice.alpha" },
};

export default config;
