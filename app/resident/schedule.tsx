import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  ScrollView,
  Text,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import { Truck } from "lucide-react-native";
import { Loader } from "../../components/ui/Loader";
import { AuthContext } from "@/context/AuthContext";

import { AppToast } from "@/components/ui/AppToast";

import React, { useContext, useEffect, useState } from "react";
import { getAllScheduleSpecifcBarangay } from "../../hooks/schedule_hook";

import { useFocusEffect } from "@react-navigation/native";


export interface ScheduleData {
  _id: string;
  [key: string]: any;
}

export default function Schedule() {
  const { user } = useContext(AuthContext)!;
  const router = useRouter();
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [today_schedules, setTodaySchedules] = useState<ScheduleData[]>([]);
  const [upcomming_schedules, setUpcommingSchedules] = useState<ScheduleData[]>(
    []
  );

  const toast = useToast();

  useFocusEffect(
    React.useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const fetchSchedules = async () => {
    try {
      const { data, success } = await getAllScheduleSpecifcBarangay(
        user?.barangay?._id || ""
      );
      if (success === true) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

        const todaySchedulesData = data.data.filter((schedule: any) => {
          const scheduleDate = new Date(schedule.scheduled_collection);
          scheduleDate.setHours(0, 0, 0, 0);

          return scheduleDate.getTime() === today.getTime();
        });

        const upcomingSchedulesData = data.data.filter((schedule: any) => {
          const scheduleDate = new Date(schedule.scheduled_collection);
          scheduleDate.setHours(0, 0, 0, 0);

          return scheduleDate.getTime() > today.getTime();
        });

        setSchedules(data.data);
        setTodaySchedules(todaySchedulesData);
        setUpcommingSchedules(upcomingSchedulesData);
      }
    } catch (error) {
      toast.show({
        placement: "top right",
        render: ({ id }) => (
          <AppToast
            id={id}
            type="error"
            title="Error"
            description="Failed to load garbage report."
          />
        ),
      });
    }
  };


  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date not available";

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColors = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return { bg: "$green100", text: "$green600" };
      case "pending":
        return { bg: "$yellow100", text: "$yellow600" };
      case "completed":
        return { bg: "$blue100", text: "$blue600" };
      case "cancelled":
        return { bg: "$red100", text: "$red600" };
      case "in progress":
        return { bg: "$purple100", text: "$purple600" };
      default:
        return { bg: "$gray100", text: "$gray600" };
    }
  };

  return (
    <Box flex={1} bg="$white">
      <ScrollView flex={1} mb="$40">
        <VStack space="lg" p="$4" pb="$32">
          <Box>
            <Text size="xl" fontWeight="$bold">
              Collection Schedule
            </Text>
            <Text color="$secondary500">{user?.barangay?.barangay_name} </Text>
          </Box>

          {/*  Collections Today */}
          {today_schedules.length >= 0 && (
            <VStack space="md">
              <Text fontWeight="$bold" color="$secondary500" size="sm">
                COLLECTIONS TODAY ({today_schedules.length})
              </Text>

              {today_schedules.map((schedule) => (
                <Card key={schedule?._id} p="$3">
                  <HStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <VStack space="xs" flex={1}>
                      <HStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text fontWeight="$bold">
                          {getDayName(schedule?.scheduled_collection)}
                        </Text>
                      </HStack>
                      <Text color="$secondary500" size="sm">
                        {formatDate(schedule?.scheduled_collection)}
                      </Text>
                      <HStack space="sm" alignItems="center">
                        <Text size="sm" color="$primary500" fontWeight="$bold">
                          {schedule?.garbage_type}
                        </Text>
                        <Text size="sm" color="$secondary500">
                          • {schedule?.truck?.truck_id}
                        </Text>
                      </HStack>
                    </VStack>

                    <Badge
                      bg={getStatusColors(schedule?.status).bg}
                      rounded="$full"
                    >
                      <BadgeText
                        color={getStatusColors(schedule?.status).text}
                        size="xs"
                      >
                        {schedule?.status}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  {schedule?.truck?.status === "On Route" && (
                    <Button
                      variant="link"
                      action="primary"
                      size="sm"
                      alignSelf="flex-start"
                      // onPress={() => handleTrackTruck(schedule)}
                    >
                      <HStack space="xs" alignItems="center">
                        <Truck size={14} color="#0066CC" />
                        <ButtonText size="sm">Track</ButtonText>
                      </HStack>
                    </Button>
                  )}
                </Card>
              ))}
            </VStack>
          )}

          {upcomming_schedules.length >= 0 && (
            <VStack space="md">
              <Text fontWeight="$bold" color="$secondary500" size="sm">
                UPCOMING COLLECTIONS ({upcomming_schedules.length})
              </Text>
              {upcomming_schedules.map((schedule) => (
              <Card key={schedule?._id} p="$3">
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack space="xs" flex={1}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="$bold">
                        {getDayName(schedule?.scheduled_collection)}
                      </Text>
                    </HStack>
                    <Text color="$secondary500" size="sm">
                      {formatDate(schedule?.scheduled_collection)}
                    </Text>
                    <HStack space="sm" alignItems="center">
                      <Text size="sm" color="$primary500" fontWeight="$bold">
                        {schedule?.garbage_type}
                      </Text>
                      <Text size="sm" color="$secondary500">
                        • {schedule?.truck?.truck_id}
                      </Text>
                    </HStack>
                  </VStack>

                  <Badge
                    bg={getStatusColors(schedule?.status).bg}
                    rounded="$full"
                  >
                    <BadgeText
                      color={getStatusColors(schedule?.status).text}
                      size="xs"
                    >
                      {schedule?.status}
                    </BadgeText>
                  </Badge>
                </HStack>
              </Card>
            ))}
            </VStack>
          )}

          <VStack space="md">
            <Text fontWeight="$bold" color="$secondary500" size="sm">
              ALL SCHEDULES ({schedules.length})
            </Text>

            {schedules.map((schedule) => (
              <Card key={schedule?._id} p="$3">
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack space="xs" flex={1}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontWeight="$bold">
                        {getDayName(schedule?.scheduled_collection)}
                      </Text>
                    </HStack>
                    <Text color="$secondary500" size="sm">
                      {formatDate(schedule?.scheduled_collection)}
                    </Text>
                    <HStack space="sm" alignItems="center">
                      <Text size="sm" color="$primary500" fontWeight="$bold">
                        {schedule?.garbage_type}
                      </Text>
                      <Text size="sm" color="$secondary500">
                        • {schedule?.truck?.truck_id}
                      </Text>
                    </HStack>
                  </VStack>

                  <Badge
                    bg={getStatusColors(schedule?.status).bg}
                    rounded="$full"
                  >
                    <BadgeText
                      color={getStatusColors(schedule?.status).text}
                      size="xs"
                    >
                      {schedule?.status}
                    </BadgeText>
                  </Badge>
                </HStack>
              </Card>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="$white"
        borderTopWidth={1}
        borderTopColor="$primary100"
        p="$4"
      >
        <Card bg="$primary50" p="$4">
          <VStack space="sm">
            <Text fontWeight="$bold" color="$primary600">
              Collection Guidelines
            </Text>
            <Text color="$primary700" size="sm">
              • Biodegradable: Food waste, yard trimmings, paper products
            </Text>
            <Text color="$primary700" size="sm">
              • Non-Biodegradable: Plastics, metals, glass, electronics
            </Text>
            <Text color="$primary700" size="sm">
              • Recyclable: Clean bottles, cans, cardboard
            </Text>
            <Text color="$primary700" size="sm">
              • Track active collections to see real-time truck location
            </Text>
          </VStack>
        </Card>
      </Box>
    </Box>
  );
}
