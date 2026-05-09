import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Send, CheckCircle } from 'lucide-react';
import UploadZone from '../components/upload/UploadZone';
import DetectionCanvas from '../components/ai/DetectionCanvas';
import SeverityCard from '../components/ai/SeverityCard';
import DetectionSummary from '../components/ai/DetectionSummary';
import VehicleRecommendation from '../components/ai/VehicleRecommendation';
import LocationStatusCard from '../components/upload/LocationStatusCard';
import { getVehicleRecommendation } from '../utils/aiSimulation';
import { saveReport, analyzeImage } from '../utils/reportStorage';

export default function UploadPage() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (file, url) => {
    setImageFile(file);
    setImageUrl(url);
    setHasAnalyzed(false);
    setAnalysisData(null);
    setLocationData(null);
  };

  const handleImageLoad = (width, height) => {
    setImageDimensions({ width, height });
  };

  const handleAnalyze = async () => {
    if (!imageFile || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const results = await analyzeImage(imageFile);
      setAnalysisData(results);
      // We also update imageUrl to the annotated one if we want to show it, or keep original.
      // Let's keep original for the canvas but we have results.annotatedImageUrl now.
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze image with AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const reportData = {
      imageUrl: analysisData.image_url || imageUrl,
      annotated_image_url: analysisData.annotatedImageUrl,
      severity: analysisData.severity,
      coveragePercentage: analysisData.coveragePercentage,
      totalObjects: analysisData.totalObjects,
      vehicleRecommended: getVehicleRecommendation(analysisData.severity).type,
      detections: analysisData.detections,
      ...locationData
    };
    
    try {
      await saveReport(reportData, null); // null because it's already uploaded
      navigate('/dashboard');
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit report. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setHasAnalyzed(false);
    setAnalysisData(null);
    setIsAnalyzing(false);
    setLocationData(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Report an Issue</h1>
        <p className="text-slate-400">Upload an image of the garbage. Our AI will handle the rest.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 md:p-8 glow-border"
          >
            {!imageUrl ? (
              <UploadZone onImageSelect={handleImageSelect} />
            ) : (
              <div className="space-y-6">
                <DetectionCanvas 
                  imageUrl={imageUrl} 
                  isScanning={isAnalyzing}
                  detections={analysisData?.detections}
                  onImageLoad={handleImageLoad}
                />
                
                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" /> Start Over
                  </button>
                  
                  {!hasAnalyzed ? (
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] ${
                        isAnalyzing ? 'opacity-75 cursor-wait' : 'hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" /> Analyze with AI
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || !locationData}
                      className={`flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] ${
                        (isSubmitting || !locationData) ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Submit to Dashboard
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: AI Analysis Results */}
        <div className="lg:col-span-4 space-y-6">
          <AnimatePresence>
            {hasAnalyzed && analysisData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <LocationStatusCard onLocationFound={setLocationData} />

                <SeverityCard 
                  severity={analysisData.severity} 
                  coveragePercentage={analysisData.coveragePercentage} 
                />
                
                <VehicleRecommendation 
                  recommendation={getVehicleRecommendation(analysisData.severity)} 
                />
                
                <DetectionSummary 
                  detections={analysisData.detections}
                  totalObjects={analysisData.totalObjects}
                />
              </motion.div>
            )}
            
            {/* Empty State before analysis */}
            {!hasAnalyzed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 h-full flex flex-col items-center justify-center text-center border-dashed border-slate-700 border-2"
              >
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Awaiting Analysis</h3>
                <p className="text-sm text-slate-400">
                  Upload an image and run the AI scanner to view severity, object detection, and recommended cleanup actions here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
