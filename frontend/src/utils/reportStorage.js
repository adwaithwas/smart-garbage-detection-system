const API_BASE_URL = 'http://localhost:8000/api/v1';

export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/reports/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.image_url;
};

export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/reports/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image analysis failed');
  }

  const data = await response.json();
  return {
    ...data,
    coveragePercentage: data.coverage_percentage,
    totalObjects: data.total_objects,
    vehicleRecommended: data.vehicle_recommended,
    annotatedImageUrl: data.annotated_image_url
  };
};

export const saveReport = async (reportData, imageFile) => {
  try {
    // 1. Upload image to Cloud/Backend Storage
    let imageUrl = reportData.imageUrl;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    } else if (imageUrl.startsWith('blob:')) {
      // Fallback if no file is provided but it's a blob
      imageUrl = 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80';
    }

    const payload = {
      ...reportData,
      image_url: imageUrl,
      // Map frontend camelCase to backend snake_case
      coverage_percentage: reportData.coveragePercentage,
      total_objects: reportData.totalObjects,
      vehicle_recommended: reportData.vehicleRecommended
    };

    // Remove old camelCase keys
    delete payload.imageUrl;
    delete payload.coveragePercentage;
    delete payload.totalObjects;
    delete payload.vehicleRecommended;
    delete payload.timestamp; // Backend sets this
    delete payload.status; // Backend sets this
    delete payload.id; // Backend generates this

    const response = await fetch(`${API_BASE_URL}/reports/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to save report');
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving report:", error);
    throw error;
  }
};

export const getReports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    const data = await response.json();
    
    // Map backend snake_case back to frontend camelCase for existing UI compatibility
    return data.map(r => ({
      ...r,
      imageUrl: r.image_url,
      coveragePercentage: r.coverage_percentage,
      totalObjects: r.total_objects,
      vehicleRecommended: r.vehicle_recommended
    }));
  } catch (error) {
    console.error("Error reading reports:", error);
    return [];
  }
};

export const updateReportStatus = async (id, newStatus) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) throw new Error('Failed to update status');
    return true;
  } catch (error) {
    console.error("Error updating report:", error);
    return false;
  }
};

export const initializeMockData = async () => {
  // Not needed anymore since we use a real database, 
  // but kept to prevent breaking existing imports if any.
  return Promise.resolve();
};
