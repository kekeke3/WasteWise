import { useEffect, useRef, useState } from "react";

// Mock location for development or when permissions are not granted
const MOCK_LOCATION = {
  coords: {
    latitude: 10.936,
    longitude: 124.609,
    altitude: null,
    accuracy: 10,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

export const useLocation = () => {
  const [location, setLocation] = useState<any>(MOCK_LOCATION);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchId = useRef<number | null>(null);

  // Initialize location permissions
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Dynamically import expo-location to avoid errors during development
      const {
        requestForegroundPermissionsAsync,
        getForegroundPermissionsAsync,
      } = await import("expo-location");

      const { status } = await getForegroundPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
        return true;
      }

      const permissionResponse = await requestForegroundPermissionsAsync();
      setPermissionGranted(permissionResponse.status === "granted");
      return permissionResponse.status === "granted";
    } catch (err) {
      console.warn("Location permissions error:", err);
      setError("Location services not available");
      return false;
    }
  };

  const startTracking = async () => {
    try {
      const hasPermission = await checkPermissions();

      if (!hasPermission) {
        setError("Location permission denied");
        return;
      }

      const { Location } = await import("expo-location");

      // Get current position first
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);

      // Start watching position
      watchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setLocation(newLocation);
          sendLocationToDashboard(newLocation);
        }
      );

      setIsTracking(true);
      setError(null);
    } catch (err) {
      console.warn("Location tracking error:", err);
      setError("Failed to start location tracking");
      // Fallback to mock location for development
      setIsTracking(true);
      simulateLocationUpdates();
    }
  };

  const stopTracking = () => {
    if (watchId.current) {
      // In a real app, you'd stop the location watcher
      // Location.stopLocationUpdatesAsync(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  const simulateLocationUpdates = () => {
    // Simulate location updates for development
    const interval = setInterval(() => {
      setLocation((prev) => ({
        ...prev,
        coords: {
          ...prev.coords,
          latitude: prev.coords.latitude + 0.0001,
          longitude: prev.coords.longitude + 0.0001,
          timestamp: Date.now(),
        },
      }));
      sendLocationToDashboard(location);
    }, 30000);

    // Store interval ID for cleanup
    watchId.current = interval as any;
  };

  const sendLocationToDashboard = (location: any) => {
    // Simulate sending location to ENRO dashboard
    console.log("📍 Sending location to ENRO:", {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date().toISOString(),
      collectorId: "current-user-id",
    });

    // In a real app, you'd make an API call here
    // await apiService.updateCollectorLocation(locationData);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId.current) {
        if (typeof watchId.current === "number") {
          // Clear interval for mock updates
          clearInterval(watchId.current);
        }
        stopTracking();
      }
    };
  }, []);

  return {
    location,
    isTracking,
    error,
    permissionGranted,
    startTracking,
    stopTracking,
  };
};
