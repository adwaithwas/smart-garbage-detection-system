export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
    if (!response.ok) throw new Error("Failed to fetch address");
    const data = await response.json();
    return data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Geocoding error:", error);
    // Mock address on failure
    return "Coordinates Locked. Address unavailable offline.";
  }
};
