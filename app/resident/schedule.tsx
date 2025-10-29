import {
  Box,
  Card,
  HStack,
  ScrollView,
  Text,
  VStack,
  Badge,
  BadgeText,
  Button,
  ButtonText,
} from "@gluestack-ui/themed";
import React from "react";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";
import { useRouter } from "expo-router";
import { Truck } from "lucide-react-native";

interface BackendSchedule {
  _id: string;
  route: {
    route_name: string;
    merge_barangay: Array<{
      barangay_id: string;
      order_index: number;
    }>;
  };
  truck: {
    truck_id: string;
    status: string;
    user: {
      first_name: string;
      last_name: string;
    };
    position: {
      lat: number;
      lng: number;
    };
  };
  status: string;
  garbage_type: "Biodegradable" | "Non Biodegradable" | "Recyclable";
  scheduled_collection: string;
  approved_at: string | null;
  remark: string;
}

interface BackendScheduleResponse {
  data: BackendSchedule[];
}

export default function Schedule() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: scheduleResponse, loading } = useFetch<BackendScheduleResponse>(
    `/schedules/barangay/${user?.barangay}`
  );

  if (loading) return <Loader />;

  // Transform backend data to frontend format
  const transformScheduleData = (backendSchedules: BackendSchedule[]) => {
    return backendSchedules.map((schedule) => {
      // Format date
      const collectionDate = new Date(schedule.scheduled_collection);
      const day = collectionDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const date = collectionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Determine time based on garbage type or other logic
      const getTimeByGarbageType = (type: string) => {
        switch (type) {
          case "Biodegradable":
            return "8:00 AM - 12:00 PM";
          case "Non Biodegradable":
            return "1:00 PM - 4:00 PM";
          case "Recyclable":
            return "9:00 AM - 11:00 AM";
          default:
            return "8:00 AM - 12:00 PM";
        }
      };

      // Get status badge color
      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "scheduled":
          case "approved":
            return {
              bg: "$success100",
              text: "$success600",
              label: "Scheduled",
            };
          case "pending":
            return { bg: "$warning100", text: "$warning600", label: "Pending" };
          case "cancelled":
            return { bg: "$error100", text: "$error600", label: "Cancelled" };
          case "completed":
            return {
              bg: "$primary100",
              text: "$primary600",
              label: "Completed",
            };
          case "on route":
            return { bg: "$info100", text: "$info600", label: "On Route" };
          default:
            return {
              bg: "$secondary100",
              text: "$secondary600",
              label: status,
            };
        }
      };

      const statusInfo = getStatusColor(schedule.status);

      // Check if truck is on route and has valid position
      const isTruckOnRoute =
        schedule.truck.status.toLowerCase() === "on route" &&
        schedule.truck.position?.lat !== 0 &&
        schedule.truck.position?.lng !== 0;

      return {
        id: schedule._id,
        day,
        date,
        time: getTimeByGarbageType(schedule.garbage_type),
        type: schedule.garbage_type,
        truck: schedule.truck.truck_id,
        driver: `${schedule.truck.user.first_name} ${schedule.truck.user.last_name}`,
        route: schedule.route.route_name,
        status: schedule.status,
        statusInfo,
        approved: !!schedule.approved_at,
        remark: schedule.remark,
        collectionDate: schedule.scheduled_collection,
        isTruckOnRoute,
        truckPosition: schedule.truck.position,
        truckStatus: schedule.truck.status,
      };
    });
  };

  // Handle track truck navigation
  const handleTrackTruck = (schedule: any) => {
    router.push({
      pathname: "/resident/track-collectors",
      params: {
        truckId: schedule.truck,
        truckPosition: JSON.stringify(schedule.truckPosition),
        scheduleId: schedule.id,
        garbageType: schedule.type,
        driver: schedule.driver,
      },
    });
  };

  // Use mock data if no schedule from API
  const schedules = scheduleResponse?.data
    ? transformScheduleData(scheduleResponse.data)
    : [
        {
          id: "1",
          day: "Monday",
          date: "October 27, 2025",
          time: "8:00 AM - 12:00 PM",
          type: "Biodegradable",
          truck: "GT101",
          driver: "Test Collector",
          route: "Route 1",
          status: "On Route",
          statusInfo: { bg: "$info100", text: "$info600", label: "On Route" },
          approved: true,
          remark: "Regular Collection",
          collectionDate: "2025-10-27",
          isTruckOnRoute: true,
          truckPosition: { lat: 11.1430521, lng: 124.6075 },
          truckStatus: "On Route",
        },
        {
          id: "2",
          day: "Wednesday",
          date: "October 29, 2025",
          time: "8:00 AM - 12:00 PM",
          type: "Non Biodegradable",
          truck: "GT202",
          driver: "You Collector",
          route: "Route 1",
          status: "Pending",
          statusInfo: {
            bg: "$warning100",
            text: "$warning600",
            label: "Pending",
          },
          approved: false,
          remark: "None",
          collectionDate: "2025-10-29",
          isTruckOnRoute: false,
          truckPosition: { lat: 0, lng: 0 },
          truckStatus: "Active",
        },
        {
          id: "3",
          day: "Friday",
          date: "October 31, 2025",
          time: "1:00 PM - 4:00 PM",
          type: "Recyclable",
          truck: "GT401",
          driver: "Admin Collector",
          route: "Route 1",
          status: "Scheduled",
          statusInfo: {
            bg: "$success100",
            text: "$success600",
            label: "Scheduled",
          },
          approved: true,
          remark: "Special Collection",
          collectionDate: "2025-10-31",
          isTruckOnRoute: true,
          truckPosition: { lat: 11.0683166, lng: 124.5545784 },
          truckStatus: "On Route",
        },
      ];

  // Sort schedules by date
  const sortedSchedules = schedules.sort(
    (a, b) =>
      new Date(a.collectionDate).getTime() -
      new Date(b.collectionDate).getTime()
  );

  // Get upcoming schedules (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const upcomingSchedules = sortedSchedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.collectionDate);
    return scheduleDate >= today && scheduleDate <= nextWeek;
  });

  // Get active schedules (today's schedules that are on route)
  const activeSchedules = sortedSchedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.collectionDate);
    const isToday = scheduleDate.toDateString() === today.toDateString();
    return isToday && schedule.isTruckOnRoute;
  });

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Collection Schedule
          </Text>
          <Text color="$secondary500">
            Barangay {user?.barangay} • {upcomingSchedules.length} upcoming
            collections
          </Text>
        </Box>

        {/* Active Collections Today */}
        {activeSchedules.length > 0 && (
          <VStack space="md">
            <Text fontWeight="$bold" color="$secondary500" size="sm">
              ACTIVE COLLECTIONS TODAY
            </Text>

            {activeSchedules.map((item) => (
              <Card
                key={item.id}
                p="$4"
                bg="$info50"
                borderColor="$info200"
                borderWidth={1}
              >
                <VStack space="sm">
                  <HStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <VStack space="xs" flex={1}>
                      <HStack space="sm" alignItems="center">
                        <Truck size={16} color="#0066CC" />
                        <Text fontWeight="$bold" size="lg" color="$info700">
                          {item.day}
                        </Text>
                      </HStack>
                      <Text color="$secondary500" size="sm">
                        {item.date}
                      </Text>
                      <Text color="$secondary500" size="sm">
                        {item.time}
                      </Text>
                    </VStack>

                    <Badge bg="$info100" rounded="$full">
                      <BadgeText color="$info600" fontWeight="$bold" size="xs">
                        Live Tracking
                      </BadgeText>
                    </Badge>
                  </HStack>

                  <HStack space="md" alignItems="center">
                    <Box bg="$primary100" px="$2" py="$1" rounded="$sm">
                      <Text color="$primary600" size="xs" fontWeight="$bold">
                        {item.type}
                      </Text>
                    </Box>

                    <Box bg="$secondary100" px="$2" py="$1" rounded="$sm">
                      <Text color="$secondary600" size="xs">
                        Truck: {item.truck}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack space="md" alignItems="center">
                    <Text color="$secondary500" size="sm">
                      Driver: {item.driver}
                    </Text>
                    <Text color="$secondary500" size="sm">
                      Route: {item.route}
                    </Text>
                  </HStack>

                  {/* Track Truck Button */}
                  <Button
                    variant="solid"
                    action="primary"
                    size="sm"
                    onPress={() => handleTrackTruck(item)}
                  >
                    <HStack space="sm" alignItems="center">
                      <Truck size={16} color="white" />
                      <ButtonText>Track Truck Location</ButtonText>
                    </HStack>
                  </Button>

                  {item.remark && item.remark !== "None" && (
                    <Text color="$info600" size="sm" fontStyle="italic">
                      Note: {item.remark}
                    </Text>
                  )}
                </VStack>
              </Card>
            ))}
          </VStack>
        )}

        {/* Upcoming Collections */}
        <VStack space="md">
          <Text fontWeight="$bold" color="$secondary500" size="sm">
            UPCOMING COLLECTIONS
          </Text>

          {upcomingSchedules.length > 0 ? (
            upcomingSchedules.map((item) => (
              <Card key={item.id} p="$4">
                <VStack space="sm">
                  <HStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <VStack space="xs" flex={1}>
                      <Text fontWeight="$bold" size="lg">
                        {item.day}
                      </Text>
                      <Text color="$secondary500" size="sm">
                        {item.date}
                      </Text>
                      <Text color="$secondary500" size="sm">
                        {item.time}
                      </Text>
                    </VStack>

                    <Badge bg={item.statusInfo.bg} rounded="$full">
                      <BadgeText
                        color={item.statusInfo.text}
                        fontWeight="$bold"
                        size="xs"
                      >
                        {item.statusInfo.label}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  <HStack space="md" alignItems="center">
                    <Box bg="$primary100" px="$2" py="$1" rounded="$sm">
                      <Text color="$primary600" size="xs" fontWeight="$bold">
                        {item.type}
                      </Text>
                    </Box>

                    <Box bg="$secondary100" px="$2" py="$1" rounded="$sm">
                      <Text color="$secondary600" size="xs">
                        Truck: {item.truck}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack space="md" alignItems="center">
                    <Text color="$secondary500" size="sm">
                      Driver: {item.driver}
                    </Text>
                    <Text color="$secondary500" size="sm">
                      Route: {item.route}
                    </Text>
                  </HStack>

                  {/* Track Truck Button - Show only if truck is on route */}
                  {item.isTruckOnRoute && (
                    <Button
                      variant="outline"
                      action="primary"
                      size="sm"
                      onPress={() => handleTrackTruck(item)}
                    >
                      <HStack space="sm" alignItems="center">
                        <Truck size={16} color="#0066CC" />
                        <ButtonText>Track Truck</ButtonText>
                      </HStack>
                    </Button>
                  )}

                  {item.remark && item.remark !== "None" && (
                    <Text color="$primary600" size="sm" fontStyle="italic">
                      Note: {item.remark}
                    </Text>
                  )}
                </VStack>
              </Card>
            ))
          ) : (
            <Card bg="$secondary50" p="$4">
              <Text textAlign="center" color="$secondary500">
                No upcoming collections scheduled for the next week.
              </Text>
            </Card>
          )}
        </VStack>

        {/* All Schedules */}
        <VStack space="md">
          <Text fontWeight="$bold" color="$secondary500" size="sm">
            ALL SCHEDULES
          </Text>

          {sortedSchedules.map((item) => (
            <Card key={item.id} p="$3">
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack space="xs" flex={1}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="$bold">{item.day}</Text>
                    {item.isTruckOnRoute && (
                      <Badge bg="$info100" rounded="$full" size="sm">
                        <BadgeText color="$info600" size="xs">
                          Live
                        </BadgeText>
                      </Badge>
                    )}
                  </HStack>
                  <Text color="$secondary500" size="sm">
                    {item.date} • {item.time}
                  </Text>
                  <HStack space="sm" alignItems="center">
                    <Text size="sm" color="$primary500" fontWeight="$bold">
                      {item.type}
                    </Text>
                    <Text size="sm" color="$secondary500">
                      • {item.truck}
                    </Text>
                  </HStack>
                </VStack>
                <Badge bg={item.statusInfo.bg} rounded="$full">
                  <BadgeText color={item.statusInfo.text} size="xs">
                    {item.statusInfo.label}
                  </BadgeText>
                </Badge>
              </HStack>

              {/* Small track button for all schedules list */}
              {item.isTruckOnRoute && (
                <Button
                  variant="link"
                  action="primary"
                  size="sm"
                  alignSelf="flex-start"
                  onPress={() => handleTrackTruck(item)}
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

        {/* Important Notes */}
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
              • Place bins outside 30 minutes before scheduled time
            </Text>
            <Text color="$primary700" size="sm">
              • Track active collections to see real-time truck location
            </Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
