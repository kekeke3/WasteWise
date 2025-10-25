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
import { staticReports } from "../../data/staticData";

export default function History() {
  const reports = staticReports;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "success";
      case "in-progress":
        return "info";
      case "pending":
        return "warning";
      default:
        return "error";
    }
  };

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Report History
          </Text>
          <Text color="$secondary500">
            Track your submitted reports and their status
          </Text>
        </Box>

        <VStack space="md">
          {reports.map((report) => (
            <Card key={report.id}>
              <VStack space="sm">
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack space="xs" flex={1}>
                    <Text fontWeight="$bold" textTransform="capitalize">
                      {report.type.replace("_", " ")}
                    </Text>
                    <Text color="$secondary500" size="sm">
                      {report.location}
                    </Text>
                    <Text size="sm">{report.description}</Text>
                  </VStack>
                  <Badge action={getStatusColor(report.status)}>
                    <BadgeText textTransform="capitalize">
                      {report.status}
                    </BadgeText>
                  </Badge>
                </HStack>

                <HStack justifyContent="space-between">
                  <Text size="sm" color="$secondary500">
                    📅 {new Date(report.submittedAt).toLocaleDateString()}
                  </Text>
                  <Text size="sm" color="$secondary500">
                    Urgency: {report.urgency}
                  </Text>
                </HStack>

                {report.response && (
                  <Box bg="$success50" p="$2" borderRadius="$sm">
                    <Text size="sm" color="$success700">
                      💬 Response: {report.response}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Card>
          ))}
        </VStack>

        {reports.length === 0 && (
          <Card>
            <Text textAlign="center" color="$secondary500">
              No reports submitted yet
            </Text>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}
