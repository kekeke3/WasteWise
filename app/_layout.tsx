import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { customConfig } from "@/📄 gluestack-ui.config";
import { GluestackUIProvider } from "@gluestack-ui/themed";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  return (
    <GluestackUIProvider config={customConfig}>
      <AuthProvider>
        <OfflineProvider>
          <NotificationProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </NotificationProvider>
        </OfflineProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}
