import {
  Badge,
  BadgeText,
  Box,
  Button,
  Card,
  HStack,
  ScrollView,
  Text,
  useToast,
  VStack,
  Progress,
  ProgressFilledTrack,
} from "@gluestack-ui/themed";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState, useContext } from "react";
import MapView, { Marker } from "react-native-maps";
import { useOffline } from "../../context/OfflineContext";
import {
  mockUser,
  staticCollectors,
  staticSchedule,
} from "../../data/staticData";
import { AuthContext } from "@/context/AuthContext";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Flag,
  Truck,
  User,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAllDataDashboard } from "../../hooks/dashboard_hook";

import { AppToast } from "@/components/ui/AppToast";

export default function ResidentDashboard() {
  const { user } = useContext(AuthContext)!;
  const { isOnline } = useOffline();
  const router = useRouter();
  const toast = useToast();

  // Use static data instead of API call
  const collectors = staticCollectors;

  // Mock data for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    totalSchedules: 0,
    upcomingSchedules: 0,
    todaySchedules: 0,
    activeCollectors: 0,
    totalCollectors: collectors.length,
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchGarbageReports();
    }, [])
  );

  const fetchGarbageReports = async () => {
    try {
      const { data, success } = await getAllDataDashboard(user?._id || "", user?.barangay?._id || "");
      if (success === true) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySchedulesData = data?.schedules?.data.filter(
          (schedule: any) => {
            const scheduleDate = new Date(schedule.scheduled_collection);
            scheduleDate.setHours(0, 0, 0, 0);

            return scheduleDate.getTime() === today.getTime();
          }
        );

        const upcomingSchedulesData = data?.schedules?.data.filter(
          (schedule: any) => {
            const scheduleDate = new Date(schedule.scheduled_collection);
            scheduleDate.setHours(0, 0, 0, 0);

            return scheduleDate.getTime() > today.getTime();
          }
        );

        const onRouteTrucksCount = data?.schedules?.data.filter((schedule: any) => {
          const scheduleDate = new Date(schedule.scheduled_collection);
          scheduleDate.setHours(0, 0, 0, 0);
        
          return scheduleDate.getTime() === today.getTime() && schedule.truck?.status === "On Route";
        });

        setDashboardStats((prevStats) => ({
          ...prevStats,
          totalSchedules: data.schedules.data.length,
          totalReports: data.garbage_reports.data.length,
          upcomingSchedules: upcomingSchedulesData.length,
          todaySchedules: todaySchedulesData.length,
          activeCollectors: onRouteTrucksCount.length,
        }));
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

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        {/* Header with Welcome & Status */}
        <Card bg="$primary50" p="$4" borderColor="$primary200">
          <HStack justifyContent="space-between" alignItems="flex-start">
            <VStack space="xs" flex={1}>
              <Text size="2xl" fontWeight="$bold" color="$primary900">
                Welcome back, {user?.first_name}!
              </Text>
              <Text color="$primary700" size="sm">
                {user?.barangay?.barangay_name} •{" "}
                {user?.role
                  ?.replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>

              {!isOnline && (
                <HStack space="sm" alignItems="center" mt="$2">
                  <AlertTriangle size={16} color="#DC2626" />
                  <Text color="$error600" size="sm" fontWeight="$medium">
                    Offline Mode - Limited functionality
                  </Text>
                </HStack>
              )}
            </VStack>

            <Box bg="$primary100" p="$2" rounded="$full">
              <User size={24} color="#1E40AF" />
            </Box>
          </HStack>
        </Card>

        {/* Stats Overview */}
        <VStack space="md">
          <Text size="lg" fontWeight="$bold" color="$secondary800">
            Overview
          </Text>

          <HStack space="md" flexWrap="wrap">
            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$purple50"
              borderColor="$purple200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$purple100" p="$2" rounded="$full">
                  <Calendar size={20} color="#7C3AED" />
                </Box>
                <Text fontWeight="$bold" color="$purple900" size="xl">
                  {dashboardStats.totalSchedules}
                </Text>
                <Text color="$purple700" size="sm" textAlign="center">
                  Total Schedules
                </Text>
              </VStack>
            </Card>

            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$blue50"
              borderColor="$blue200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$blue100" p="$2" rounded="$full">
                  <Flag size={20} color="#1E40AF" />
                </Box>
                <Text fontWeight="$bold" color="$blue900" size="xl">
                  {dashboardStats.totalReports}
                </Text>
                <Text color="$blue700" size="sm" textAlign="center">
                  Total Reports
                </Text>
              </VStack>
            </Card>

            {/* Schedules Card */}
            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$green50"
              borderColor="$green200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$green100" p="$2" rounded="$full">
                  <Calendar size={20} color="#059669" />
                </Box>
                <Text fontWeight="$bold" color="$green900" size="xl">
                  {dashboardStats.upcomingSchedules}
                </Text>
                <Text color="$green700" size="sm" textAlign="center">
                  Upcoming Schedules
                </Text>
              </VStack>
            </Card>

            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$green50"
              borderColor="$green200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$green100" p="$2" rounded="$full">
                  <Calendar size={20} color="#059669" />
                </Box>
                <Text fontWeight="$bold" color="$green900" size="xl">
                  {dashboardStats.todaySchedules}
                </Text>
                <Text color="$green700" size="sm" textAlign="center">
                  Today Schedules
                </Text>
              </VStack>
            </Card>
          </HStack>

          <HStack space="md" flexWrap="wrap">
            {/* Collectors Card */}
            <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$orange50"
              borderColor="$orange200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$orange100" p="$2" rounded="$full">
                  <Truck size={20} color="#EA580C" />
                </Box>
                <Text fontWeight="$bold" color="$orange900" size="xl">
                  {dashboardStats.activeCollectors}
                </Text>
                <Text color="$orange700" size="sm" textAlign="center">
                  Active Now
                </Text>
              </VStack>
            </Card>

            {/* Pending Card */}
            {/* <Card
              flex={1}
              minWidth="$32"
              p="$3"
              bg="$red50"
              borderColor="$red200"
            >
              <VStack space="xs" alignItems="center">
                <Box bg="$red100" p="$2" rounded="$full">
                  <Clock size={20} color="#DC2626" />
                </Box>
                <Text fontWeight="$bold" color="$red900" size="xl">
                  {dashboardStats.pendingReports}
                </Text>
                <Text color="$red700" size="sm" textAlign="center">
                  Pending
                </Text>
              </VStack>
            </Card> */}
          </HStack>
        </VStack>

        {/* Live Collector Tracking */}
        <Card p="$4" borderColor="$primary200">
          <HStack justifyContent="space-between" alignItems="center" mb="$4">
            <VStack space="xs">
              <Text size="lg" fontWeight="$bold" color="$secondary800">
                Live Collector Tracking
              </Text>
              <Text color="$secondary500" size="sm">
                Real-time garbage truck locations
              </Text>
            </VStack>
            <Link href="/resident/track_collectors" asChild>
              <Button size="sm" variant="link">
                <Text color="$primary600">View All</Text>
              </Button>
            </Link>
          </HStack>

          <Box h={200} borderRadius="$lg" overflow="hidden" mb="$3">
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
              <Marker
                coordinate={{ latitude: 10.936, longitude: 124.609 }}
                title="Your Location"
                pinColor="blue"
              />

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

          <VStack space="sm">
            {collectors.map((collector) => (
              <HStack
                key={collector.id}
                space="md"
                alignItems="center"
                p="$2"
                bg="$secondary50"
                rounded="$md"
              >
                <Box
                  w="$2"
                  h="$2"
                  bg={
                    collector.status === "active"
                      ? "$success500"
                      : "$warning500"
                  }
                  rounded="$full"
                />
                <VStack flex={1} space="xs">
                  <Text size="sm" fontWeight="$medium">
                    {collector.name}
                  </Text>
                  <Text size="xs" color="$secondary600">
                    {collector.vehicle}
                  </Text>
                </VStack>
                <Badge
                  size="sm"
                  action={collector.status === "active" ? "success" : "warning"}
                >
                  <BadgeText size="xs">
                    {collector.status === "active" ? "Active" : "On Break"}
                  </BadgeText>
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
