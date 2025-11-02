import { Box, Image } from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useEffect, useContext } from "react";
import { View } from "react-native";

import { AuthContext } from "@/context/AuthContext";   

export default function Index() {
  const { user, loading } = useContext(AuthContext)!; 

  const router = useRouter();

  useEffect(() => {
    // Check if router is ready before navigating
    if (!loading) {
      const redirect = () => {
        if (!user || user.is_verified === false) {
          // Redirect to login if no user, not authenticated, or not verified
          console.log(
            "Redirecting to login - user not authenticated or not verified"
          );
          router.replace("/auth/login");
        } else if (user.role === "resident") {
          console.log("Redirecting to resident dashboard");
          router.replace("/resident");
        } else if (user.role === "collector") {
          console.log("Redirecting to collector dashboard");
          router.replace("/collector");
        } else {
          console.log("Redirecting to login - unknown role");
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