import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as Location from 'expo-location';
import { AuthContext } from "@/context/AuthContext"; 

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface ScheduleData {
  _id: string;
  scheduled_collection: string;
  truck: {
    status: string;
    _id: string;
  };
  route: {
    merge_barangay: Array<{
      barangay_id: string;
    }>;
  };
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  schedules: ScheduleData[];
  getCurrentLocation: () => Promise<LocationData | null>;
  startWatching: () => void;
  stopWatching: () => void;
  isWatching: boolean;
  sendLocation: (locationData: LocationData) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ 
  children 
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleData[]>([]);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const { user } = useContext(AuthContext)!;

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      ws.current = new WebSocket("wss://waste-wise-backend-uzub.onrender.com");

      ws.current.onopen = () => {
        console.log('WebSocket connected successfully');
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.name) {
            case "trucks":
              console.log("Received trucks data");

              const onRouteTrucks = message.data.filter((schedule: ScheduleData) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const scheduleDate = new Date(schedule.scheduled_collection);
                scheduleDate.setHours(0, 0, 0, 0);

                return (
                  scheduleDate.getTime() === today.getTime() &&
                  schedule.truck?.status === "On Route" &&
                  schedule.route.merge_barangay.some(
                    (barangay: any) =>
                      barangay.barangay_id.toString() === user?.barangay?._id
                  )
                );
              });

              const list = user?.role !== "resident" ? message.data : onRouteTrucks;
              setSchedules(list);
              break;
            default:
              console.log("Unknown WebSocket message:", message.name);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        // Optional: Implement reconnection logic here
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError('Failed to connect to WebSocket');
    }
  };

  // Send location via WebSocket
  const sendLocation = (locationData: LocationData) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({
          type: 'LOCATION_UPDATE',
          data: locationData,
          userId: user?._id, // Include user ID if needed
          timestamp: Date.now()
        }));
        console.log('Location sent via WebSocket:', locationData);
      } catch (error) {
        console.error('Error sending location via WebSocket:', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send location');
    }
  };

  // Get single location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        //timeout: 15000,
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        //accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationData);
      
      // Send to WebSocket
      sendLocation(locationData);

      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      setError((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Watch location continuously
  const startWatching = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000,   // Update every 5 seconds
        },
        (newLocation) => {
          const locationData: LocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
           // accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          };

          setLocation(locationData);
          
          // Send real-time updates to WebSocket
          sendLocation(locationData);
        }
      );

      setSubscription(sub);
      setIsWatching(true);
      console.log('Started watching location');
    } catch (error) {
      console.error('Error watching location:', error);
      setError((error as Error).message);
    }
  };

  const stopWatching = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsWatching(false);
    console.log('Stopped watching location');
  };

  // Reconnect WebSocket if needed
  const reconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
    connectWebSocket();
  };

  const value: LocationContextType = {
    location,
    loading,
    error,
    schedules,
    getCurrentLocation,
    startWatching,
    stopWatching,
    isWatching,
    sendLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};