import { Box, Image } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    // Check if router is ready before navigating
    if (!loading) {
      const redirect = () => {
        if (!user) {
          router.replace("/auth/login");
        } else if (user.role === "resident") {
          router.replace("/resident");
        } else if (user.role === "garbage_collector") {
          router.replace("/collector");
        } else {
          router.replace("/auth/login");
        }
      };

      // Small delay to ensure everything is mounted
      const timer = setTimeout(redirect, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, user, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Box alignItems="center" mb="$8">
        <Image
          source={require("../assets/logo.png")}
          alt="WasteWise Logo"
          width={120}
          height={120}
          resizeMode="contain"
        />
      </Box>
    </View>
  );
}
