import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Progress,
  ProgressFilledTrack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Link } from "expo-router";
import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContextOrig";
import { useLocation } from "../../hooks/useLocation";

interface CollectorStats {
  totalAreas: number;
  completedAreas: number;
  pendingAreas: number;
  todayCollection: number;
}

export default function CollectorDashboard() {
  const { user } = useAuth();
  const { location, isTracking, startTracking, stopTracking } = useLocation();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [todayStats, setTodayStats] = useState<CollectorStats>({
    totalAreas: 15,
    completedAreas: 3,
    pendingAreas: 12,
    todayCollection: 450,
  });

  useEffect(() => {
    // Auto-start GPS tracking when clocked in
    if (isClockedIn && !isTracking) {
      startTracking();
    }
  }, [isClockedIn]);

  const handleClockInOut = async () => {
    if (isClockedIn) {
      await stopTracking();
      setIsClockedIn(false);
    } else {
      setIsClockedIn(true);
    }
  };

  const progress = (todayStats.completedAreas / todayStats.totalAreas) * 100;

  if (!user) return <Loader />;

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        {/* Welcome Section */}
        <Box>
          <Text size="2xl" fontWeight="$bold">
            Welcome, {user?.first_name}!
          </Text>
          <Text color="$secondary500">Garbage Collector</Text>

          {/* Status Badge */}
          <HStack space="sm" alignItems="center" mt="$2">
            <Box
              w="$2"
              h="$2"
              bg={isClockedIn ? "$success500" : "$error500"}
              rounded="$full"
            />
            <Text
              color={isClockedIn ? "$success600" : "$error600"}
              fontWeight="$medium"
            >
              {isClockedIn ? "Currently on duty" : "Off duty"}
            </Text>
          </HStack>
        </Box>

        {/* Clock In/Out Card */}
        <Card>
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <VStack space="xs">
                <Text fontWeight="$bold" size="lg">
                  {isClockedIn ? "On Duty" : "Off Duty"}
                </Text>
                <Text color="$secondary500" size="sm">
                  {isClockedIn
                    ? "GPS tracking active"
                    : "Tap to start your shift"}
                </Text>
              </VStack>
              <Badge size="lg" action={isClockedIn ? "success" : "error"}>
                <BadgeText>{isClockedIn ? "ON DUTY" : "OFF DUTY"}</BadgeText>
              </Badge>
            </HStack>

            <Button
              onPress={handleClockInOut}
              action={isClockedIn ? "negative" : "positive"}
            >
              <ButtonText>{isClockedIn ? "Clock Out" : "Clock In"}</ButtonText>
            </Button>

            {isClockedIn && (
              <HStack space="sm" alignItems="center">
                <MapPin size={16} color="#10B981" />
                <Text size="sm" color="$success600">
                  GPS Tracking: {location ? "Active" : "Acquiring location..."}
                </Text>
              </HStack>
            )}
          </VStack>
        </Card>

        {/* Today's Progress */}
        <Card>
          <VStack space="md">
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="$bold">Today&apos;s Progress</Text>
              <Text color="$secondary500">
                {todayStats.completedAreas}/{todayStats.totalAreas} areas
              </Text>
            </HStack>

            <Progress value={progress} size="md">
              <ProgressFilledTrack />
            </Progress>

            <HStack justifyContent="space-between">
              <VStack alignItems="center">
                <CheckCircle size={24} color="#10B981" />
                <Text fontWeight="$bold" color="$success600">
                  {todayStats.completedAreas}
                </Text>
                <Text size="sm" color="$secondary500">
                  Completed
                </Text>
              </VStack>

              <VStack alignItems="center">
                <AlertTriangle size={24} color="#F59E0B" />
                <Text fontWeight="$bold" color="$warning600">
                  {todayStats.pendingAreas}
                </Text>
                <Text size="sm" color="$secondary500">
                  Pending
                </Text>
              </VStack>

              <VStack alignItems="center">
                <Clock size={24} color="#3B82F6" />
                <Text fontWeight="$bold" color="$primary600">
                  {todayStats.todayCollection}kg
                </Text>
                <Text size="sm" color="$secondary500">
                  Collected
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Quick Actions */}
        <VStack space="sm">
          <Text size="lg" fontWeight="$bold">
            Quick Actions
          </Text>

          <HStack space="sm">
            <Link href="/collector/routes" asChild>
              <Button flex={1} action="primary" isDisabled={!isClockedIn}>
                <ButtonText>View Routes</ButtonText>
              </Button>
            </Link>

            <Link href="/collector/report" asChild>
              <Button flex={1} variant="outline" isDisabled={!isClockedIn}>
                <ButtonText>Report Issue</ButtonText>
              </Button>
            </Link>
          </HStack>
        </VStack>

        {/* Current Location */}
        {location && (
          <Card>
            <VStack space="sm">
              <Text fontWeight="$bold">Current Location</Text>
              <Text color="$secondary500" size="sm">
                Latitude: {location.latitude.toFixed(6)}
              </Text>
              <Text color="$secondary500" size="sm">
                Longitude: {location.longitude.toFixed(6)}
              </Text>
              <Text color="$secondary500" size="sm">
                Last updated: {new Date().toLocaleTimeString()}
              </Text>
            </VStack>
          </Card>
        )}

        {/* Today's Schedule */}
        <Card>
          <VStack space="sm">
            <Text fontWeight="$bold">Today&apos;s Schedule</Text>
            <VStack space="xs">
              <HStack justifyContent="space-between">
                <Text color="$secondary500">Shift Time</Text>
                <Text>7:00 AM - 4:00 PM</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="$secondary500">Assigned Truck</Text>
                <Text>Truck A (ABC-123)</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text color="$secondary500">Team Leader</Text>
                <Text>Juan Dela Cruz</Text>
              </HStack>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
