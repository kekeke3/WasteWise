import {
  Box,
  Card,
  HStack,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import React from "react";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { CollectionSchedule } from "../../types";

interface ScheduleResponse {
  data: CollectionSchedule[];
}

export default function Schedule() {
  const { user } = useAuth();
  const { data: schedule, loading } = useFetch<ScheduleResponse>(
    `/schedules/barangay/${user?.barangay}`
  );

  if (loading) return <Loader />;

  const mockSchedule = [
    { day: "Monday", time: "8:00 AM - 12:00 PM", type: "Regular Collection" },
    {
      day: "Wednesday",
      time: "8:00 AM - 12:00 PM",
      type: "Regular Collection",
    },
    { day: "Friday", time: "8:00 AM - 12:00 PM", type: "Regular Collection" },
    { day: "Saturday", time: "1:00 PM - 4:00 PM", type: "Special Collection" },
  ];

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Collection Schedule
          </Text>
          <Text color="$secondary500">Barangay {user?.barangay}</Text>
        </Box>

        <VStack space="md">
          {mockSchedule.map((item, index) => (
            <Card key={index}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack space="xs">
                  <Text fontWeight="$bold">{item.day}</Text>
                  <Text color="$secondary500">{item.time}</Text>
                  <Text size="sm" color="$primary500">
                    {item.type}
                  </Text>
                </VStack>
                <Box bg="$primary100" px="$3" py="$1" rounded="$full">
                  <Text color="$primary600" size="sm">
                    Active
                  </Text>
                </Box>
              </HStack>
            </Card>
          ))}
        </VStack>

        {/* Important Notes */}
        <Card bg="$primary50">
          <VStack space="sm">
            <Text fontWeight="$bold" color="$primary600">
              Important Notes
            </Text>
            <Text color="$primary700" size="sm">
              • Please place your garbage bins outside by 7:00 AM
            </Text>
            <Text color="$primary700" size="sm">
              • Separate biodegradable from non-biodegradable waste
            </Text>
            <Text color="$primary700" size="sm">
              • No collection on holidays - schedule shifts to next day
            </Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
