import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaExpand,
  FaCompress,
  FaSpinner,
  FaExclamationTriangle,
  FaFilePdf,
  FaHome,
  FaPrint,
  FaExternalLinkAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearchPlus,
  FaSearchMinus,
} from 'react-icons/fa';

function PDFViewer() {
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPdfPage, setCurrentPdfPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('pdfUrl');
    
    if (url) {
      setPdfUrl(url);
      loadPDFWithProxy(url);
    } else {
      setError('No PDF URL provided');
      setLoading(false);
    }
  }, [location.search]);

  // ✅ SIMPLIFIED PDF loading using PROXY ONLY
  const loadPDFWithProxy = async (url) => {
    try {
      setLoading(true);
      setError(null);
      
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      // ✅ ALWAYS use proxy endpoint - consistent with ViewContent.jsx
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      console.log("Using PDF proxy for certificate:", url);
      console.log("API URL:", apiUrl);
      
      const proxyResponse = await fetch(`${apiUrl}/pdf-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl: url })
      });
      
      console.log("Proxy response status:", proxyResponse.status);
      
      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text();
        console.error("Proxy error response:", errorText);
        throw new Error(`Proxy error! status: ${proxyResponse.status} - ${errorText}`);
      }
      
      const arrayBuffer = await proxyResponse.arrayBuffer();
      console.log("Received arrayBuffer size:", arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;

      const pages = [];
      
      // Convert each page to image
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        
        // Set scale for better quality
        const renderScale = 2.0;
        const viewport = page.getViewport({ scale: renderScale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        pages.push({
          pageNumber: pageNum,
          imageUrl: imageUrl,
          width: viewport.width,
          height: viewport.height
        });
      }

      setPdfPages(pages);
      setCurrentPdfPage(0);
      console.log(`Successfully converted ${pages.length} pages to images`);
      
    } catch (error) {
      console.error("Error loading PDF via proxy:", error);
      setError(`Gagal memuat file PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  function changePage(offset) {
    setCurrentPdfPage(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.max(0, Math.min(newPage, pdfPages.length - 1));
    });
  }

  function goToPage(page) {
    const pageNum = Math.max(0, Math.min(page - 1, pdfPages.length - 1));
    setCurrentPdfPage(pageNum);
  }

  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.5));
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

  function downloadPDF() {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `certificate_${Date.now()}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openInNewTab() {
    window.open(pdfUrl, '_blank');
  }

  function printPDF() {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

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
            Error Loading PDF
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
                onClick={downloadPDF}
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
              <FaFilePdf className="text-red-500 text-xl" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Certificate Viewer
              </span>
              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                Proxy Mode
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={printPDF}
                className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                title="Print"
              >
                <FaPrint />
              </button>
              <button
                onClick={downloadPDF}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Download"
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
                title="Fullscreen"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PDF Viewer Container */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-12 text-center">
            <FaSpinner className="text-blue-500 text-4xl sm:text-6xl mx-auto mb-4 animate-spin" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loading PDF...
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Menggunakan proxy server untuk mengakses sertifikat
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            {/* PDF Controls */}
            {pdfPages.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600">
                {/* Mobile Layout (Stacked) */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => changePage(-1)}
                      disabled={currentPdfPage <= 0}
                      className="flex items-center gap-1 px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <FaChevronLeft className="text-xs" />
                      Prev
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300">Page</span>
                      <input
                        type="number"
                        min="1"
                        max={pdfPages.length}
                        value={currentPdfPage + 1}
                        onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                        className="w-12 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-xs dark:bg-gray-600 dark:text-white"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        of {pdfPages.length}
                      </span>
                    </div>

                    <button
                      onClick={() => changePage(1)}
                      disabled={currentPdfPage >= pdfPages.length - 1}
                      className="flex items-center gap-1 px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Next
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>

                  {/* Zoom Controls */}
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

                {/* Tablet Layout (Stacked but wider) */}
                <div className="hidden sm:flex lg:hidden flex-col gap-3">
                  {/* Navigation Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => changePage(-1)}
                      disabled={currentPdfPage <= 0}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronLeft />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Page</span>
                      <input
                        type="number"
                        min="1"
                        max={pdfPages.length}
                        value={currentPdfPage + 1}
                        onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-sm dark:bg-gray-600 dark:text-white"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        of {pdfPages.length}
                      </span>
                    </div>

                    <button
                      onClick={() => changePage(1)}
                      disabled={currentPdfPage >= pdfPages.length - 1}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <FaChevronRight />
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center justify-center gap-2">
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
                      Reset
                    </button>
                  </div>
                </div>

                {/* Desktop Layout (Original horizontal layout) */}
                <div className="hidden lg:flex items-center justify-between flex-wrap gap-4">
                  {/* Navigation Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changePage(-1)}
                      disabled={currentPdfPage <= 0}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronLeft />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Page</span>
                      <input
                        type="number"
                        min="1"
                        max={pdfPages.length}
                        value={currentPdfPage + 1}
                        onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-sm dark:bg-gray-600 dark:text-white"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        of {pdfPages.length}
                      </span>
                    </div>

                    <button
                      onClick={() => changePage(1)}
                      disabled={currentPdfPage >= pdfPages.length - 1}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <FaChevronRight />
                    </button>
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
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PDF Document Display */}
            <div className="p-3 sm:p-6">
              {pdfPages.length > 0 ? (
                <div>
                  {/* Current Page Display */}
                  <div className="flex justify-center bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 rounded-lg">
                    <div className="shadow-2xl w-full max-w-full overflow-auto flex justify-center">
                      <img
                        src={pdfPages[currentPdfPage]?.imageUrl}
                        alt={`PDF Page ${currentPdfPage + 1}`}
                        className="max-w-full h-auto shadow-lg rounded-lg"
                        style={{ 
                          transform: `scale(${scale})`,
                          transformOrigin: 'center center',
                          maxHeight: scale > 1 ? 'none' : '80vh'
                        }}
                      />
                    </div>
                  </div>

                  {/* Page Thumbnails */}
                  {pdfPages.length > 1 && (
                    <div className="mt-4 sm:mt-6">
                      <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        Halaman Lainnya:
                      </h4>
                      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3">
                        {pdfPages.map((page, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPdfPage(index)}
                            className={`flex-shrink-0 relative ${
                              index === currentPdfPage 
                                ? 'ring-2 ring-blue-500' 
                                : 'hover:ring-1 hover:ring-gray-300'
                            } rounded transition-all`}
                          >
                            <img
                              src={page.imageUrl}
                              alt={`Page ${index + 1}`}
                              className="w-16 h-20 sm:w-20 sm:h-28 object-cover rounded shadow-md"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 sm:px-2 py-1 rounded-b">
                              {index + 1}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <FaFilePdf className="text-gray-400 text-4xl sm:text-6xl mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">No PDF content available</p>
                </div>
              )}
            </div>
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

export default PDFViewer;