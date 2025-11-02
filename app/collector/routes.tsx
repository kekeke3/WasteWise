import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Card,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Check, MapPin, Navigation } from "lucide-react-native";
import React, { useState } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useAuth } from "../../context/AuthContextOrig";

interface CollectionArea {
  id: string;
  name: string;
  completed: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  estimatedTime: string;
  houses: number;
}

export default function RoutesScreen() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<CollectionArea[]>([
    {
      id: "1",
      name: "Barangay 1 - Zone A",
      completed: true,
      coordinates: { latitude: 10.936, longitude: 124.609 },
      estimatedTime: "45 min",
      houses: 25,
    },
    {
      id: "2",
      name: "Barangay 1 - Zone B",
      completed: true,
      coordinates: { latitude: 10.938, longitude: 124.611 },
      estimatedTime: "30 min",
      houses: 18,
    },
    {
      id: "3",
      name: "Barangay 1 - Zone C",
      completed: false,
      coordinates: { latitude: 10.934, longitude: 124.613 },
      estimatedTime: "60 min",
      houses: 32,
    },
    {
      id: "4",
      name: "Barangay 1 - Zone D",
      completed: false,
      coordinates: { latitude: 10.932, longitude: 124.608 },
      estimatedTime: "40 min",
      houses: 22,
    },
  ]);

  const toggleAreaCompletion = (areaId: string) => {
    setAreas(
      areas.map((area) =>
        area.id === areaId ? { ...area, completed: !area.completed } : area
      )
    );
  };

  const completedAreas = areas.filter((area) => area.completed).length;
  const totalAreas = areas.length;

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Collection Routes
          </Text>
          <Text color="$secondary500">
            {completedAreas}/{totalAreas} areas completed
          </Text>
        </Box>

        {/* Progress Summary */}
        <Card>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontWeight="$bold">Today&apos;s Progress</Text>
              <Badge
                action={completedAreas === totalAreas ? "success" : "info"}
              >
                <BadgeText>
                  {completedAreas === totalAreas ? "Completed" : "In Progress"}
                </BadgeText>
              </Badge>
            </HStack>
            <Text color="$secondary500">
              Complete your assigned areas and mark them as done
            </Text>
          </VStack>
        </Card>

        {/* Map View */}
        <Box h={250} borderRadius="$md" overflow="hidden">
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
            {areas.map((area, index) => (
              <Marker
                key={area.id}
                coordinate={area.coordinates}
                title={area.name}
                description={`${area.houses} houses • ${area.estimatedTime}`}
                pinColor={area.completed ? "green" : "red"}
              />
            ))}

            {/* Route line */}
            <Polyline
              coordinates={areas.map((area) => area.coordinates)}
              strokeColor="#3B82F6"
              strokeWidth={4}
              lineDashPattern={[10, 10]}
            />
          </MapView>
        </Box>

        {/* Areas List */}
        <VStack space="md">
          <Text size="lg" fontWeight="$bold">
            Assigned Areas
          </Text>

          {areas.map((area) => (
            <Card key={area.id}>
              <HStack space="md" alignItems="center">
                <Checkbox
                  value={area.completed ? "true" : "false"}
                  onChange={() => toggleAreaCompletion(area.id)}
                  isDisabled={area.completed}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={Check} />
                  </CheckboxIndicator>
                </Checkbox>

                <VStack flex={1} space="xs">
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="$bold">{area.name}</Text>
                    <Badge
                      size="sm"
                      action={area.completed ? "success" : "error"}
                    >
                      <BadgeText>
                        {area.completed ? "Completed" : "Pending"}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  <HStack space="md">
                    <HStack space="xs" alignItems="center">
                      <MapPin size={14} color="#6B7280" />
                      <Text size="sm" color="$secondary500">
                        {area.houses} houses
                      </Text>
                    </HStack>
                    <HStack space="xs" alignItems="center">
                      <Navigation size={14} color="#6B7280" />
                      <Text size="sm" color="$secondary500">
                        {area.estimatedTime}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
            </Card>
          ))}
        </VStack>

        {/* Action Buttons */}
        <VStack space="sm">
          <Button action="primary">
            <ButtonText>Start Navigation</ButtonText>
          </Button>

          <Button variant="outline">
            <ButtonText>View Full Route Details</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
