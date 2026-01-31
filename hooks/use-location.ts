// import * as Location from "expo-location";
// import { useEffect, useState } from "react";

// export interface LocationData {
//   latitude: number;
//   longitude: number;
//   accuracy: number | null;
// }

// export interface UseLocationReturn {
//   location: LocationData | null;
//   error: string | null;
//   isLoading: boolean;
//   hasPermission: boolean | null;
//   requestPermission: () => Promise<boolean>;
//   getCurrentLocation: () => Promise<LocationData | null>;
// }

// export const useLocation = (): UseLocationReturn => {
//   const [location, setLocation] = useState<LocationData | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [hasPermission, setHasPermission] = useState<boolean | null>(null);

//   const requestPermission = async (): Promise<boolean> => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       const { status } = await Location.requestForegroundPermissionsAsync();

//       if (status !== "granted") {
//         setHasPermission(false);
//         setError(
//           "Location permission was denied. Please enable it in settings."
//         );
//         setIsLoading(false);
//         return false;
//       }

//       setHasPermission(true);
//       setIsLoading(false);
//       return true;
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "Failed to request location permission";
//       setError(errorMessage);
//       setHasPermission(false);
//       setIsLoading(false);
//       return false;
//     }
//   };

//   const getCurrentLocation = async (): Promise<LocationData | null> => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Check if we have permission first
//       const { status: existingStatus } =
//         await Location.getForegroundPermissionsAsync();

//       if (existingStatus !== "granted") {
//         const permissionGranted = await requestPermission();
//         if (!permissionGranted) {
//           setIsLoading(false);
//           return null;
//         }
//       }

//       // Get current location
//       const locationData = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       const locationResult: LocationData = {
//         latitude: locationData.coords.latitude,
//         longitude: locationData.coords.longitude,
//         accuracy: locationData.coords.accuracy,
//       };

//       setLocation(locationResult);
//       setIsLoading(false);
//       return locationResult;
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to get current location";
//       setError(errorMessage);
//       setIsLoading(false);
//       return null;
//     }
//   };

//   // Check existing permission status on mount
//   useEffect(() => {
//     const checkPermission = async () => {
//       try {
//         const { status } = await Location.getForegroundPermissionsAsync();
//         setHasPermission(status === "granted");
//       } catch {
//         setHasPermission(false);
//       }
//     };

//     checkPermission();
//   }, []);

//   return {
//     location,
//     error,
//     isLoading,
//     hasPermission,
//     requestPermission,
//     getCurrentLocation,
//   };
// };
