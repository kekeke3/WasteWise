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
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { useOffline } from "../../context/OfflineContext";
import { useFetch } from "../../hooks/useFetch";
import { CollectionSchedule } from "../../types";

interface ScheduleResponse {
  data: CollectionSchedule;
}

export default function ResidentDashboard() {
  const { user } = useAuth();
  const { pendingActions, isOnline } = useOffline();
  const { data: schedule, loading } =
    useFetch<ScheduleResponse>("/schedules/current");

  if (loading) return <Loader />;

  const getNextCollection = (): {
    date: string;
    time: string;
    status: string;
    type: string;
  } => {
    // Mock data - replace with actual API data
    return {
      date: "2024-01-15",
      time: "8:00 AM - 12:00 PM",
      status: "scheduled",
      type: "Regular Collection",
    };
  };

  const nextCollection = getNextCollection();

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        {/* Welcome Section */}
        <Box>
          <Text size="2xl" fontWeight="$bold">
            Welcome, {user?.firstName}!
          </Text>
          <Text color="$secondary500">Barangay {user?.barangay}</Text>

          {/* Offline Indicator */}
          {!isOnline && (
            <Badge action="error" mt="$2">
              <BadgeText>Offline Mode</BadgeText>
            </Badge>
          )}
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

        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <Card>
            <VStack space="sm">
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="$bold">Pending Sync</Text>
                <Badge>
                  <BadgeText>{pendingActions.length}</BadgeText>
                </Badge>
              </HStack>
              <Text color="$secondary500">
                You have {pendingActions.length} pending{" "}
                {pendingActions.length === 1 ? "action" : "actions"} that will
                sync when online
              </Text>
              <Link href="/offline/queue" asChild>
                <Button variant="outline" size="sm">
                  <Text>View Queue</Text>
                </Button>
              </Link>
            </VStack>
          </Card>
        )}

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
