import {
  Box,
  Button,
  ButtonText,
  Card,
  Input,
  InputField,
  ScrollView,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  Textarea,
  TextareaInput,
  VStack
} from "@gluestack-ui/themed";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContextOrig";
import { useOffline } from "../../context/OfflineContext";


interface ReportFormData {
  type:
    | "truck_breakdown"
    | "missed_area"
    | "route_issue"
    | "safety_concern"
    | "other";
  description: string;
  location: string;
  urgency: "low" | "medium" | "high";
}

export default function CollectorReportScreen() {
  const { user } = useAuth();
  const { addPendingAction, isOnline } = useOffline();
  const [formData, setFormData] = useState<ReportFormData>({
    type: "missed_area",
    description: "",
    location: "",
    urgency: "medium",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.description) {
      alert("Please provide a description");
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        ...formData,
        submittedBy: user?.id,
        barangay: user?.barangay,
        timestamp: new Date().toISOString(),
      };

      if (isOnline) {
        // Submit to API
        console.log("Submitting report:", reportData);
        alert("Issue reported successfully! ENRO has been notified.");
        setFormData({
          type: "missed_area",
          description: "",
          location: "",
          urgency: "medium",
        });
      } else {
        // Add to offline queue
        await addPendingAction({
          type: "SUBMIT_COLLECTOR_REPORT",
          data: reportData,
        });
        alert("Report saved offline. It will sync when you are back online.");
        setFormData({
          type: "missed_area",
          description: "",
          location: "",
          urgency: "medium",
        });
      }
    } catch (error: any) {
      alert("Failed to submit report: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">
            Report an Issue
          </Text>
          <Text color="$secondary500">
            Report truck issues, missed areas, or safety concerns
          </Text>
        </Box>

        <VStack space="md">
          <VStack space="sm">
            <Text fontWeight="$bold">Issue Type</Text>
            <Select
              selectedValue={formData.type}
              onValueChange={(value: string) =>
                setFormData({
                  ...formData,
                  type: value as ReportFormData["type"],
                })
              }
            >
              <SelectTrigger>
                <SelectInput placeholder="Select issue type" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Truck Breakdown" value="truck_breakdown" />
                  <SelectItem label="Missed Area" value="missed_area" />
                  <SelectItem label="Route Issue" value="route_issue" />
                  <SelectItem label="Safety Concern" value="safety_concern" />
                  <SelectItem label="Other" value="other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Urgency Level</Text>
            <Select
              selectedValue={formData.urgency}
              onValueChange={(value: string) =>
                setFormData({
                  ...formData,
                  urgency: value as "low" | "medium" | "high",
                })
              }
            >
              <SelectTrigger>
                <SelectInput placeholder="Select urgency" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Low" value="low" />
                  <SelectItem label="Medium" value="medium" />
                  <SelectItem label="High" value="high" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Location</Text>
            <Input>
              <InputField
                placeholder="Where is the issue located?"
                value={formData.location}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, location: text })
                }
              />
            </Input>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Description</Text>
            <Textarea>
              <TextareaInput
                placeholder="Please describe the issue in detail..."
                value={formData.description}
                onChangeText={(text: string) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </Textarea>
          </VStack>

          <Button onPress={handleSubmit} disabled={loading}>
            <ButtonText>
              {isOnline ? "Submit Report to ENRO" : "Save Offline"}
            </ButtonText>
          </Button>

          {!isOnline && (
            <Text color="$warning500" textAlign="center" size="sm">
              You are currently offline. Report will be submitted when
              connection is restored.
            </Text>
          )}
        </VStack>

        {/* Emergency Contacts */}
        <Card bg="$red50">
          <VStack space="sm">
            <Text fontWeight="$bold" color="$red600">
              🚨 Emergency Contacts
            </Text>
            <Text size="sm" color="$red700">
              • ENRO Office: (032) 123-4567
            </Text>
            <Text size="sm" color="$red700">
              • Team Leader: Juan - 0912-345-6789
            </Text>
            <Text size="sm" color="$red700">
              • Maintenance: Pedro - 0917-890-1234
            </Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
}
