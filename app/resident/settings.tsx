import { userService } from "@/services/userService";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Box,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import {
  Bell,
  HelpCircle,
  LogOut,
  MapPin,
  Shield,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import { LocationModal } from "../../components/LocationModal";
import { useAuth } from "../../context/AuthContext";
import { useOffline } from "../../context/OfflineContext";

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { isOnline } = useOffline();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const handleLogout = async () => {
    setShowLogoutAlert(false);
    await logout();
  };

  const handleLocationSet = async (location: { lat: number; lng: number }) => {
    try {
      setUpdatingLocation(true);

      if (user) {
        // Update user location in backend
        await userService.updateUserLocation(user._id, {
          latitude: location.lat,
          longitude: location.lng,
        });
        // Update local user state
        const updatedUser = {
          ...user,
          position: location,
        };
        updateUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating location:", error);
    } finally {
      setUpdatingLocation(false);
      setShowLocationModal(false);
    }
  };

  const getLocationStatus = () => {
    if (!user?.position?.lat || !user?.position?.lng) {
      return { status: "Not Set", color: "$red500", bg: "$red50" };
    }
    return { status: "Set", color: "$success500", bg: "$success50" };
  };

  const locationStatus = getLocationStatus();

  return (
    <>
      <ScrollView flex={1} bg="$white">
        <VStack space="lg" p="$4">
          <Box>
            <Text size="xl" fontWeight="$bold">
              Settings
            </Text>
            <Text color="$secondary500">
              Manage your account and preferences
            </Text>
          </Box>

          {/* User Profile Card */}
          <Box bg="$primary50" p="$4" borderRadius="$md">
            <HStack space="md" alignItems="center">
              <Box
                bg="$primary500"
                w="$12"
                h="$12"
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$white" fontWeight="$bold" size="lg">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </Text>
              </Box>
              <VStack flex={1}>
                <Text fontWeight="$bold">
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text color="$secondary500" size="sm">
                  Barangay {user?.barangay}
                </Text>
                <Text color="$secondary500" size="sm">
                  {user?.email}
                </Text>

                {/* Location Status */}
                <HStack space="sm" alignItems="center" mt="$1">
                  <Box
                    w="$2"
                    h="$2"
                    bg={locationStatus.color}
                    rounded="$full"
                  />
                  <Text size="xs" color={locationStatus.color}>
                    Pickup Location: {locationStatus.status}
                  </Text>
                </HStack>

                {/* Show Coordinates if available */}
                {user?.position?.lat && user?.position?.lng && (
                  <Text size="xs" color="$secondary500" mt="$1">
                    Coordinates: {user.position.lat.toFixed(6)},{" "}
                    {user.position.lng.toFixed(6)}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>

          {/* Settings Options */}
          <VStack space="md">
            {/* Account Settings */}
            <Box>
              <Text fontWeight="$bold" mb="$2" color="$secondary500" size="sm">
                ACCOUNT
              </Text>
              <VStack space="xs">
                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  action="secondary"
                >
                  <HStack space="md" alignItems="center">
                    <User size={20} color="#666" />
                    <Text>Edit Profile</Text>
                  </HStack>
                </Button>

                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  action="secondary"
                  onPress={() => setShowLocationModal(true)}
                >
                  <HStack space="md" alignItems="center">
                    <MapPin size={20} color="#666" />
                    <VStack>
                      <Text>Change Pickup Location</Text>
                      <Text size="xs" color="$secondary500">
                        Update your trash indicator pin
                      </Text>
                    </VStack>
                  </HStack>
                </Button>

                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  action="secondary"
                >
                  <HStack space="md" alignItems="center">
                    <Bell size={20} color="#666" />
                    <Text>Notification Preferences</Text>
                  </HStack>
                </Button>
              </VStack>
            </Box>

            <Divider />

            {/* App Settings */}
            <Box>
              <Text fontWeight="$bold" mb="$2" color="$secondary500" size="sm">
                APP
              </Text>
              <VStack space="xs">
                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  action="secondary"
                >
                  <HStack space="md" alignItems="center">
                    <Shield size={20} color="#666" />
                    <Text>Privacy & Security</Text>
                  </HStack>
                </Button>

                <Button
                  variant="outline"
                  justifyContent="flex-start"
                  action="secondary"
                >
                  <HStack space="md" alignItems="center">
                    <HelpCircle size={20} color="#666" />
                    <Text>Help & Support</Text>
                  </HStack>
                </Button>
              </VStack>
            </Box>

            <Divider />

            {/* Network Status */}
            <Box
              bg={isOnline ? "$success50" : "$warning50"}
              p="$3"
              borderRadius="$md"
            >
              <HStack space="sm" alignItems="center">
                <Box
                  w="$2"
                  h="$2"
                  bg={isOnline ? "$success500" : "$warning500"}
                  rounded="$full"
                />
                <Text
                  size="sm"
                  color={isOnline ? "$success700" : "$warning700"}
                >
                  {isOnline
                    ? "Online - All features available"
                    : "Offline - Limited functionality"}
                </Text>
              </HStack>
            </Box>

            {/* Current Location Display */}
            {user?.position?.lat && user?.position?.lng && (
              <Box bg="$blue50" p="$3" borderRadius="$md">
                <VStack space="xs">
                  <Text fontWeight="$bold" size="sm" color="$blue700">
                    Current Pickup Location
                  </Text>
                  <Text size="xs" color="$blue600">
                    Latitude: {user.position.lat.toFixed(6)}
                  </Text>
                  <Text size="xs" color="$blue600">
                    Longitude: {user.position.lng.toFixed(6)}
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    alignSelf="flex-start"
                    onPress={() => setShowLocationModal(true)}
                  >
                    <Text color="$blue600" size="xs">
                      Change Location
                    </Text>
                  </Button>
                </VStack>
              </Box>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              action="negative"
              borderColor="$red500"
              onPress={() => setShowLogoutAlert(true)}
            >
              <HStack space="md" alignItems="center">
                <LogOut size={20} color="#DC2626" />
                <Text color="$red600">Log Out</Text>
              </HStack>
            </Button>

            {/* App Version */}
            <Box alignItems="center" mt="$4">
              <Text color="$secondary500" size="sm">
                Version 1.0.0
              </Text>
            </Box>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Location Modal */}
      <LocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleLocationSet}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text fontWeight="$bold">Log Out</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              Are you sure you want to log out? You&apos;ll need to sign in
              again to access your account.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup space="lg">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowLogoutAlert(false)}
              >
                <Text>Cancel</Text>
              </Button>
              <Button action="negative" onPress={handleLogout}>
                <Text color="$white">Log Out</Text>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
