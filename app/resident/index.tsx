import {
  Badge,
  BadgeText,
  Box,
  Button,
  Card,
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Link } from "expo-router";
import React from "react";
import MapView, { Marker } from "react-native-maps";
import { useAuth } from "../../context/AuthContext";
import { useOffline } from "../../context/OfflineContext";
import {
  mockUser,
  staticCollectors,
  staticSchedule,
} from "../../data/staticData";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const { pendingActions, isOnline } = useOffline();

  // Use static data instead of API call
  const schedule = staticSchedule[0]; // Next collection
  const collectors = staticCollectors;

  const getNextCollection = () => {
    const today = new Date().getDay();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Find next collection day
    const nextCollection =
      staticSchedule.find((item) => days.indexOf(item.day) >= today) ||
      staticSchedule[0];

    return {
      date: `Next ${nextCollection.day}`,
      time: nextCollection.time,
      status: nextCollection.status,
      type:
        nextCollection.type === "regular"
          ? "Regular Collection"
          : "Special Collection",
      collector: collectors.find((c) => c.id === nextCollection.collectorId),
    };
  };

  const nextCollection = getNextCollection();

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        {/* Welcome Section */}
        <Box>
          <Text size="2xl" fontWeight="$bold">
            Welcome, {user?.first_name || mockUser.first_name}{" "}
            {user?.last_name || mockUser.last_name}!
          </Text>
          <Text color="$secondary500">
            Barangay {user?.barangay || mockUser.barangay}
          </Text>

          {!isOnline && (
            <Badge action="error" mt="$2">
              <BadgeText>Offline Mode</BadgeText>
            </Badge>
          )}
        </Box>

        {/* Map with Collector Locations */}
        <Box>
          <HStack justifyContent="space-between" alignItems="center" mb="$2">
            <Text size="lg" fontWeight="$bold">
              Live Collector Tracking
            </Text>
            <Link href="/resident/track-collectors" asChild>
              <Button size="sm" variant="link">
                <Text color="$primary600">View All</Text>
              </Button>
            </Link>
          </HStack>

          <Box h={200} borderRadius="$md" overflow="hidden">
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 10.936,
                longitude: 124.609,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={true}
            >
              {/* User location */}
              <Marker
                coordinate={{ latitude: 10.936, longitude: 124.609 }}
                title="Your Location"
                pinColor="blue"
              />

              {/* Collector locations */}
              {collectors.map((collector, index) => (
                <Marker
                  key={collector.id}
                  coordinate={collector.currentLocation}
                  title={`Collector: ${collector.name}`}
                  description={`Vehicle: ${collector.vehicle}`}
                  pinColor="green"
                />
              ))}
            </MapView>
          </Box>

          {/* Active Collectors List */}
          <VStack space="xs" mt="$2">
            {collectors.map((collector) => (
              <HStack key={collector.id} space="sm" alignItems="center">
                <Box w="$2" h="$2" bg="$success500" rounded="$full" />
                <Text size="sm">
                  {collector.name} - {collector.vehicle}
                </Text>
                <Badge
                  size="sm"
                  action={collector.status === "active" ? "success" : "warning"}
                >
                  <BadgeText>
                    {collector.status === "active" ? "Active" : "On Break"}
                  </BadgeText>
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Next Collection Card */}
        <Card>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="$bold" size="lg">
                Next Collection
              </Text>
              <Badge
                action={
                  nextCollection.status === "scheduled" ? "info" : "success"
                }
              >
                <BadgeText>{nextCollection.status}</BadgeText>
              </Badge>
            </HStack>

            <VStack space="xs">
              <Text>📅 {nextCollection.date}</Text>
              <Text>⏰ {nextCollection.time}</Text>
              <Text>🗑️ {nextCollection.type}</Text>
              {nextCollection.collector && (
                <Text>👷 {nextCollection.collector.name}</Text>
              )}
            </VStack>

            <Link href="/resident/schedule" asChild>
              <Button variant="outline" mt="$2">
                <Text>View Full Schedule</Text>
              </Button>
            </Link>
          </VStack>
        </Card>

        {/* Quick Actions */}
        <VStack space="sm">
          <Text size="lg" fontWeight="$bold">
            Quick Actions
          </Text>
          <HStack space="sm">
            <Link href="/resident/schedule" asChild>
              <Button flex={1} action="primary">
                <Text color="$white">View Schedule</Text>
              </Button>
            </Link>
            <Link href="/resident/report" asChild>
              <Button flex={1} action="secondary">
                <Text>Report Issue</Text>
              </Button>
            </Link>
          </HStack>
        </VStack>

        {/* Recent Activity */}
        <Card>
          <VStack space="sm">
            <Text fontWeight="$bold">Recent Activity</Text>
            <Text color="$secondary500">No recent activity</Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
