import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaDownload,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaExclamationTriangle,
  FaImage,
  FaHome,
  FaPrint,
  FaExternalLinkAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaCertificate,
  FaEye,
} from 'react-icons/fa';

function ImageViewer() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('imageUrl') || params.get('certificateUrl');
    
    if (url) {
      setImageUrl(url);
      setLoading(false);
    } else {
      setError('No certificate image URL provided');
      setLoading(false);
    }
  }, [location.search]);

  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 5.0));
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.3));
  }

  function resetZoom() {
    setScale(1.0);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `certificate_${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openInNewTab() {
    window.open(imageUrl, '_blank');
  }

  function printImage() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              text-align: center;
              background: white;
            }
            img { 
              max-width: 100%; 
              height: auto;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            @media print {
              body { margin: 0; padding: 0; }
              img { 
                width: 100%; 
                height: auto;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="Certificate" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  const handleImageLoad = () => {
    setImageLoaded(true);
    setError(null);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setError('Failed to load certificate image. Please try again or contact support.');
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Error Loading Certificate
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FaSpinner />
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <FaArrowLeft />
              Go Back
            </button>
          </div>
          
          {/* Alternative options */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Try these alternatives:
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={downloadImage}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 text-sm"
              >
                <FaDownload />
                Download
              </button>
              <button
                onClick={openInNewTab}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1 text-sm"
              >
                <FaExternalLinkAlt />
                New Tab
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${isFullscreen ? 'p-0' : 'p-6'}`}>
      {/* Header Controls */}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FaArrowLeft />
                Back
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaHome />
                Home
              </button>
            </div>

            {/* Center Info */}
            <div className="flex items-center gap-2">
              <FaCertificate className="text-green-500 text-xl" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Certificate Viewer
              </span>
              <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                PNG Image
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={printImage}
                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                title="Print Certificate"
              >
                <FaPrint />
              </button>
              <button
                onClick={downloadImage}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Download Certificate"
              >
                <FaDownload />
              </button>
              <button
                onClick={openInNewTab}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                title="Open in New Tab"
              >
                <FaExternalLinkAlt />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Viewer Container */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-12 text-center">
            <FaSpinner className="text-blue-500 text-4xl sm:text-6xl mx-auto mb-4 animate-spin" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loading Certificate...
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Memuat gambar sertifikat
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Image Controls */}
            <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
              {/* Mobile Layout */}
              <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={zoomOut}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Zoom Out"
                  >
                    <FaSearchMinus className="text-sm" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[50px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Zoom In"
                  >
                    <FaSearchPlus className="text-sm" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-2 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaEye className="text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Certificate Preview
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={zoomOut}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Zoom Out"
                  >
                    <FaSearchMinus />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Zoom In"
                  >
                    <FaSearchPlus />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Reset Zoom
                  </button>
                </div>
              </div>
            </div>

            {/* Certificate Image Display */}
            <div className="p-3 sm:p-6">
              {imageUrl ? (
                <div className="flex justify-center bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 rounded-lg">
                  <div className="shadow-2xl w-full max-w-full overflow-auto flex justify-center">
                    {!imageLoaded && (
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <FaSpinner className="text-2xl sm:text-3xl lg:text-4xl text-gray-400 animate-spin mx-auto mb-3 sm:mb-4" />
                          <p className="text-gray-600 text-sm sm:text-base">
                            Loading certificate image...
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <img
                      src={imageUrl}
                      alt="Certificate"
                      className="max-w-full h-auto shadow-lg rounded-lg"
                      style={{ 
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        maxHeight: scale > 1 ? 'none' : '80vh',
                        display: imageLoaded ? 'block' : 'none'
                      }}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <FaImage className="text-gray-400 text-4xl sm:text-6xl mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    No certificate image available
                  </p>
                </div>
              )}
            </div>

            {/* Image Info */}
            {imageLoaded && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaCertificate className="text-green-500" />
                    <span>High Quality Certificate (PNG)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Zoom: {Math.round(scale * 100)}%</span>
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Ready to Download
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
        >
          <FaCompress />
        </button>
      )}
    </div>
  );
}

export default ImageViewer;