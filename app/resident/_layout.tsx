import { LocationModal } from "@/components/LocationModal";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { User } from "@/types";
import { config } from "@gluestack-ui/config";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { Tabs } from "expo-router";
import {
  Calendar,
  Flag,
  History,
  Home,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";

export default function ResidentLayout() {
  const { user, updateUser } = useAuth();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    // Check if user has location set
    if (user && (!user.position?.lat || !user.position?.lng)) {
      // Show modal after a short delay to let the app load
      const timer = setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLocationSet = async (location: { lat: number; lng: number }) => {
    try {
      if (user) {
        // Update user location in backend
        await userService.updateUserLocation(user._id, {
          latitude: location.lat,
          longitude: location.lng,
        });

        // Update local user state
        const updatedUser: User = {
          ...user,
          position: location,
        };
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  };

  const handleCloseModal = () => {
    setShowLocationModal(false);
  };

  return (
    <GluestackUIProvider config={config}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
          },
          tabBarActiveTintColor: "#007BFF",
          tabBarInactiveTintColor: "#999999",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="schedule"
          options={{
            title: "Schedule",
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size} />
            ),
          }}
        />

        {/*      <Tabs.Screen
          name="track-collectors"
          options={{
            title: "Track",
            tabBarIcon: ({ color, size }) => (
              <MapPin color={color} size={size} />
            ),
          }}
        /> */}

        <Tabs.Screen
          name="report"
          options={{
            title: "Report",
            tabBarIcon: ({ color, size }) => <Flag color={color} size={size} />,
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, size }) => (
              <History color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <SettingsIcon color={color} size={size} />
            ),
          }}
        />
      </Tabs>

      <LocationModal
        visible={showLocationModal}
        onClose={handleCloseModal}
        onLocationSet={handleLocationSet}
      />
    </GluestackUIProvider>
  );
}
