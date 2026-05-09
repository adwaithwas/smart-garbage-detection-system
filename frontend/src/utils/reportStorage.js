// A simple LocalStorage-based service for reports MVP
export const STORAGE_KEY = 'cleansight_reports';

export const saveReport = (reportData) => {
  try {
    const existingReports = getReports();
    const newReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };
    
    // Convert image blob URL to base64 if needed, 
    // but for this MVP session, we'll keep the blob URL or mock it if it breaks.
    // NOTE: Blob URLs don't persist across reloads. For a real MVP we'd use base64 or IndexedDB.
    // For simplicity, we'll mock the image URL if it's a blob.
    if (newReport.imageUrl && newReport.imageUrl.startsWith('blob:')) {
      newReport.imageUrl = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80'; // Mock garbage image for persistence
    }

    const updatedReports = [newReport, ...existingReports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    return newReport;
  } catch (error) {
    console.error("Error saving report:", error);
    return null;
  }
};

export const getReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading reports:", error);
    return [];
  }
};

export const getReportById = (id) => {
  const reports = getReports();
  return reports.find(r => r.id === id);
};

export const clearReports = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Populate with mock data if empty
export const initializeMockData = () => {
  const existing = getReports();
  if (existing.length === 0) {
    const mockReports = [
      {
        id: 'report-1',
        imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80',
        severity: 'High',
        coveragePercentage: 45.2,
        totalObjects: 8,
        vehicleRecommended: 'Heavy Garbage Truck',
        latitude: 40.7128 + (Math.random() * 0.02 - 0.01),
        longitude: -74.0060 + (Math.random() * 0.02 - 0.01),
        address: 'Downtown Metro Station, Sector 4',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'Pending'
      },
      {
        id: 'report-2',
        imageUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=800&q=80',
        severity: 'Medium',
        coveragePercentage: 22.5,
        totalObjects: 4,
        vehicleRecommended: 'Medium Garbage Van',
        latitude: 40.7128 + (Math.random() * 0.02 - 0.01),
        longitude: -74.0060 + (Math.random() * 0.02 - 0.01),
        address: 'Riverside Park Entrance',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'In Progress'
      },
      {
        id: 'report-3',
        imageUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&q=80',
        severity: 'Low',
        coveragePercentage: 8.4,
        totalObjects: 2,
        vehicleRecommended: 'Small Utility Vehicle',
        latitude: 40.7128 + (Math.random() * 0.02 - 0.01),
        longitude: -74.0060 + (Math.random() * 0.02 - 0.01),
        address: 'Main Street Plaza',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'Pending'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReports));
  }
};
