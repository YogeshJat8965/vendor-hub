/**
 * Client-side location detection: reads the browser's GPS/network location,
 * then reverse-geocodes it to a city name via BigDataCloud's free, key-less
 * reverse-geocode endpoint. Used to prioritize vendors near the customer on
 * the Explore page without requiring a paid maps API key.
 */

export interface DetectedLocation {
  city: string;
  state?: string;
}

export class GeolocationDeniedError extends Error {}
export class GeolocationUnavailableError extends Error {}

export function detectUserCity(): Promise<DetectedLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new GeolocationUnavailableError('Geolocation is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (!response.ok) {
            throw new Error('Reverse geocoding request failed');
          }
          const data = await response.json();
          const city: string | undefined = data.city || data.locality || data.principalSubdivision;
          if (!city) {
            reject(new GeolocationUnavailableError('Could not determine your city.'));
            return;
          }
          resolve({ city, state: data.principalSubdivision });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Failed to resolve your location.'));
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new GeolocationDeniedError('Location permission denied.'));
        } else {
          reject(new GeolocationUnavailableError('Unable to retrieve your location.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  });
}
