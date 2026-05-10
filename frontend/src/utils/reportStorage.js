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
    coveragePercentage:  data.coverage_percentage,
    totalObjects:        data.total_objects,
    vehicleRecommended:  data.vehicle_recommended,
    annotatedImageUrl:   data.annotated_image_url,
    hazardousCount:      data.hazardous_count  ?? 0,
    recyclableCount:     data.recyclable_count ?? 0,
    garbageCount:        data.garbage_count    ?? 0,
    bottleCount:         data.bottle_count     ?? 0,
    plasticCount:        data.plastic_count    ?? 0,
    metalCount:          data.metal_count      ?? 0,
    paperCount:          data.paper_count      ?? 0,
    glassCount:          data.glass_count      ?? 0,
    bagCount:            data.bag_count        ?? 0,
    cigaretteCount:      data.cigarette_count  ?? 0,
    mixedCount:          data.mixed_count      ?? 0,
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
      image_url:           imageUrl,
      // Map frontend camelCase to backend snake_case
      coverage_percentage: reportData.coveragePercentage,
      total_objects:       reportData.totalObjects,
      vehicle_recommended: reportData.vehicleRecommended,
      hazardous_count:     reportData.hazardousCount  ?? 0,
      recyclable_count:    reportData.recyclableCount ?? 0,
      garbage_count:       reportData.garbageCount    ?? 0,
      bottle_count:        reportData.bottleCount     ?? 0,
      plastic_count:       reportData.plasticCount    ?? 0,
      metal_count:         reportData.metalCount      ?? 0,
      paper_count:         reportData.paperCount      ?? 0,
      glass_count:         reportData.glassCount      ?? 0,
      bag_count:           reportData.bagCount        ?? 0,
      cigarette_count:     reportData.cigaretteCount  ?? 0,
      mixed_count:         reportData.mixedCount      ?? 0,
    };

    // Remove old camelCase keys
    delete payload.imageUrl;
    delete payload.coveragePercentage;
    delete payload.totalObjects;
    delete payload.vehicleRecommended;
    delete payload.hazardousCount;
    delete payload.recyclableCount;
    delete payload.garbageCount;
    delete payload.annotatedImageUrl;
    delete payload.timestamp; // Backend sets this
    delete payload.status;    // Backend sets this
    delete payload.id;        // Backend generates this

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
      imageUrl:         r.image_url,
      coveragePercentage: r.coverage_percentage,
      totalObjects:     r.total_objects,
      vehicleRecommended: r.vehicle_recommended,
      hazardousCount:   r.hazardous_count  ?? 0,
      recyclableCount:  r.recyclable_count ?? 0,
      garbageCount:     r.garbage_count    ?? 0,
      bottleCount:      r.bottle_count     ?? 0,
      plasticCount:     r.plastic_count    ?? 0,
      metalCount:       r.metal_count      ?? 0,
      paperCount:       r.paper_count      ?? 0,
      glassCount:       r.glass_count      ?? 0,
      bagCount:         r.bag_count        ?? 0,
      cigaretteCount:   r.cigarette_count  ?? 0,
      mixedCount:       r.mixed_count      ?? 0,
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
