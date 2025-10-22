import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/context/AuthContext";
import { customConfig } from "@/📄 gluestack-ui.config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { ToastProvider } from "@gluestack-ui/toast";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <GluestackUIProvider config={customConfig}>
      <ToastProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
}
