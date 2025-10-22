import { Box, Button, Input, InputField, ScrollView, Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger, Text, Textarea, TextareaInput, VStack } from '@gluestack-ui/themed';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { reportService } from '../../services/reportService';
import { Report } from '../../types';

interface ReportFormData {
  type: Report['type'];
  description: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
}

export default function ReportScreen() {
  const { user } = useAuth();
  const { addPendingAction, isOnline } = useOffline();
  const [formData, setFormData] = useState<ReportFormData>({
    type: 'uncollected',
    description: '',
    location: user?.address || '',
    urgency: 'medium'
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!formData.description) {
      alert('Please provide a description');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const reportData: Omit<Report, 'id' | 'status' | 'submittedBy' | 'barangay' | 'createdAt' | 'response'> & {
        barangay: string;
        submittedBy: string;
      } = {
        ...formData,
        barangay: user.barangay,
        submittedBy: user.id,
      };

      if (isOnline) {
        await reportService.submitReport(reportData);
        alert('Report submitted successfully!');
        setFormData({
          type: 'uncollected',
          description: '',
          location: user?.address || '',
          urgency: 'medium'
        });
      } else {
        // Add to offline queue
        await addPendingAction({
          type: 'SUBMIT_REPORT',
          data: reportData
        });
        alert('Report saved offline. It will sync when you are back online.');
        setFormData({
          type: 'uncollected',
          description: '',
          location: user?.address || '',
          urgency: 'medium'
        });
      }
    } catch (error: any) {
      alert('Failed to submit report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView flex={1} bg="$white">
      <VStack space="lg" p="$4">
        <Box>
          <Text size="xl" fontWeight="$bold">Report an Issue</Text>
          <Text color="$secondary500">Report uncollected garbage or other issues</Text>
        </Box>

        <VStack space="md">
          <VStack space="sm">
            <Text fontWeight="$bold">Issue Type</Text>
            <Select onValueChange={(value: string) => setFormData({...formData, type: value as Report['type']})}>
              <SelectTrigger>
                <SelectInput placeholder="Select issue type" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Uncollected Garbage" value="uncollected" />
                  <SelectItem label="Missed Area" value="missed_area" />
                  <SelectItem label="Overflowing Bin" value="overflowing" />
                  <SelectItem label="Other" value="other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Urgency Level</Text>
            <Select onValueChange={(value: string) => setFormData({...formData, urgency: value as 'low' | 'medium' | 'high'})}>
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
                placeholder="Where did this happen?"
                value={formData.location}
                onChangeText={(text: string) => setFormData({...formData, location: text})}
              />
            </Input>
          </VStack>

          <VStack space="sm">
            <Text fontWeight="$bold">Description</Text>
            <Textarea>
              <TextareaInput 
                placeholder="Please describe the issue in detail..."
                value={formData.description}
                onChangeText={(text: string) => setFormData({...formData, description: text})}
                multiline
                numberOfLines={4}
              />
            </Textarea>
          </VStack>

          <Button onPress={handleSubmit} disabled={loading}>
            <Text color="$white">
              {isOnline ? 'Submit Report' : 'Save Offline'}
            </Text>
          </Button>

          {!isOnline && (
            <Text color="$warning500" textAlign="center" size="sm">
              You are currently offline. Report will be submitted when connection is restored.
            </Text>
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
}