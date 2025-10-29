import { Stack } from "expo-router";
import "react-native-reanimated";

import { AuthProvider } from "@/context/AuthContext";
import { OfflineProvider } from "@/context/OfflineContext";
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
          <OfflineProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
            </Stack>
            {/*             <StatusBar style="auto" />
             */}
          </OfflineProvider>
        </AuthProvider>
      </ToastProvider>
    </GluestackUIProvider>
  );
}
