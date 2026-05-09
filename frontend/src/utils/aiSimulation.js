const GARBAGE_CLASSES = [
  'Plastic Bottle',
  'Plastic Bag',
  'Food Wrapper',
  'Metal Can',
  'Cardboard',
  'Glass Bottle',
  'Textile Scrap',
  'Organic Waste',
  'Cigarette Butt',
  'E-Waste'
];

export const simulateAIDetection = (imageWidth, imageHeight) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate random number of detections (between 2 and 8)
      const numDetections = Math.floor(Math.random() * 7) + 2;
      const detections = [];
      let totalArea = 0;

      for (let i = 0; i < numDetections; i++) {
        // Generate random box dimensions
        const width = Math.random() * (imageWidth * 0.3) + 40; // max 30% width, min 40px
        const height = Math.random() * (imageHeight * 0.3) + 40; // max 30% height, min 40px
        
        // Ensure box is within image bounds
        const x = Math.random() * (imageWidth - width);
        const y = Math.random() * (imageHeight - height);

        const category = GARBAGE_CLASSES[Math.floor(Math.random() * GARBAGE_CLASSES.length)];
        const confidence = (Math.random() * 0.25 + 0.74).toFixed(2); // 74% to 99%

        totalArea += width * height;

        detections.push({
          id: `det-${i}-${Date.now()}`,
          category,
          confidence: parseFloat(confidence),
          box: { x, y, width, height }
        });
      }

      const imageArea = imageWidth * imageHeight;
      let coveragePercentage = (totalArea / imageArea) * 100;
      
      // Cap at 95% for realism
      coveragePercentage = Math.min(coveragePercentage * 2.5, 95); 

      let severity = 'Low';
      if (coveragePercentage > 30) severity = 'High';
      else if (coveragePercentage > 10) severity = 'Medium';

      resolve({
        detections,
        coveragePercentage: coveragePercentage.toFixed(1),
        severity,
        totalObjects: numDetections
      });
    }, 2500); // Simulate 2.5s processing time
  });
};

export const getVehicleRecommendation = (severity) => {
  switch (severity) {
    case 'High':
      return { type: 'Heavy Garbage Truck', icon: 'truck', color: 'text-red-400', bg: 'bg-red-500/10' };
    case 'Medium':
      return { type: 'Medium Garbage Van', icon: 'van', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    default:
      return { type: 'Small Utility Vehicle', icon: 'car', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  }
};
