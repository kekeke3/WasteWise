import {
    Badge,
    BadgeText,
    Box,
    Card,
    HStack,
    ScrollView,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import React from "react";
import MapView, { Marker } from "react-native-maps";
import { staticCollectors } from "../../data/staticData";

export default function TrackCollectors() {
  const collectors = staticCollectors;

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Live Collector Tracking
          </Text>
          <Text color="$secondary500">
            Real-time location of garbage collection teams
          </Text>
        </Box>

        {/* Map View */}
        <Box h={300} borderRadius="$md" overflow="hidden">
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 10.936,
              longitude: 124.609,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
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
            {collectors.map((collector) => (
              <Marker
                key={collector.id}
                coordinate={collector.currentLocation}
                title={`Collector: ${collector.name}`}
                description={`Vehicle: ${collector.vehicle}\nStatus: ${collector.status}`}
                pinColor={collector.status === "active" ? "green" : "orange"}
              />
            ))}
          </MapView>
        </Box>

        {/* Collectors List */}
        <VStack space="md">
          <Text size="lg" fontWeight="$bold">
            Active Collectors ({collectors.length})
          </Text>

          {collectors.map((collector) => (
            <Card key={collector.id}>
              <VStack space="sm">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="$bold">{collector.name}</Text>
                  <Badge
                    action={
                      collector.status === "active" ? "success" : "warning"
                    }
                  >
                    <BadgeText>
                      {collector.status === "active" ? "Active" : "On Break"}
                    </BadgeText>
                  </Badge>
                </HStack>

                <Text color="$secondary500">{collector.vehicle}</Text>
                <Text size="sm">📞 {collector.phone}</Text>

                <HStack space="sm" alignItems="center">
                  <Text size="sm" color="$secondary500">
                    Last updated:
                  </Text>
                  <Text size="sm">
                    {new Date(collector.lastUpdated).toLocaleTimeString()}
                  </Text>
                </HStack>

                <Box bg="$primary50" p="$2" borderRadius="$sm">
                  <Text size="sm" color="$primary700">
                    📍 Current Area: Near{" "}
                    {collector.currentLocation.latitude > 10.937
                      ? "Market"
                      : "Residential Area"}
                  </Text>
                </Box>
              </VStack>
            </Card>
          ))}
        </VStack>

        {/* Legend */}
        <Card bg="$secondary50">
          <VStack space="sm">
            <Text fontWeight="$bold" size="sm">
              Map Legend
            </Text>
            <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="blue" rounded="$sm" />
              <Text size="sm">Your Location</Text>
            </HStack>
            <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="green" rounded="$sm" />
              <Text size="sm">Active Collector</Text>
            </HStack>
            <HStack space="sm" alignItems="center">
              <Box w="$3" h="$3" bg="orange" rounded="$sm" />
              <Text size="sm">Collector on Break</Text>
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
