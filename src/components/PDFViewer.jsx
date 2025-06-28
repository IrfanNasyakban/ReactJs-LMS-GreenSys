import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
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
} from 'react-icons/fa';

import { AiOutlineZoomOut, AiOutlineZoomIn } from "react-icons/ai";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function PDFViewer() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMethod, setViewMethod] = useState('react-pdf'); // 'react-pdf', 'iframe', 'direct'
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('pdfUrl');
    
    if (url) {
      setPdfUrl(url);
      loadPDF(url);
    } else {
      setError('No PDF URL provided');
      setLoading(false);
    }
  }, [location.search]);

  // Enhanced PDF loading with multiple fallback methods
  const loadPDF = async (url) => {
    try {
      setLoading(true);
      setError(null);
      
      // Method 1: Try loading with authentication for react-pdf
      const success = await loadPDFWithAuth(url);
      if (success) {
        setViewMethod('react-pdf');
        return;
      }
      
      // Method 2: Fallback to direct iframe
      console.log('Fallback to iframe method');
      setViewMethod('iframe');
      setLoading(false);
      
    } catch (err) {
      console.error('All PDF loading methods failed:', err);
      setError(err.message || 'Failed to load PDF');
      setLoading(false);
    }
  };

  // Load PDF data for react-pdf with authentication
  const loadPDFWithAuth = async (url) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Try the API endpoint first (for authenticated access)
      let fetchUrl = url;
      if (url.includes('/certificates/')) {
        // Convert direct URL to API endpoint
        const filename = url.split('/certificates/')[1];
        fetchUrl = `${process.env.REACT_APP_URL_API}/certificate/${filename}`;
      }
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/pdf',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If API fails, try direct URL
        console.log('API endpoint failed, trying direct URL');
        return await loadPDFDirect(url);
      }

      const blob = await response.blob();
      
      // Verify it's a PDF
      if (blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
        throw new Error('Response is not a PDF file');
      }

      const arrayBuffer = await blob.arrayBuffer();
      setPdfData(arrayBuffer);
      return true;
      
    } catch (error) {
      console.warn('Auth PDF loading failed:', error);
      return false;
    }
  };

  // Load PDF directly without authentication
  const loadPDFDirect = async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      setPdfData(arrayBuffer);
      return true;
      
    } catch (error) {
      console.warn('Direct PDF loading failed:', error);
      return false;
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error('PDF document load error:', error);
    // Fallback to iframe method
    console.log('React-PDF failed, switching to iframe');
    setViewMethod('iframe');
    setLoading(false);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(newPage, numPages || 1));
    });
  }

  function goToPage(page) {
    const pageNum = Math.max(1, Math.min(page, numPages || 1));
    setPageNumber(pageNum);
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

  // Render different view methods
  const renderPDFViewer = () => {
    if (viewMethod === 'react-pdf' && pdfData) {
      return (
        <div className="flex justify-center bg-gray-50 dark:bg-gray-900 min-h-[600px] p-6">
          <div className="shadow-2xl">
            <Document
              file={pdfData}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center h-96">
                  <FaSpinner className="text-blue-500 text-4xl mb-4 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-96">
                  <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
                  <p className="text-red-600 dark:text-red-400">Failed to load PDF</p>
                  <button
                    onClick={() => setViewMethod('iframe')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Try Alternative View
                  </button>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </Document>
          </div>
        </div>
      );
    }

    // Fallback to iframe
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900">
        <iframe
          src={pdfUrl}
          width="100%"
          height={isFullscreen ? "100vh" : "800px"}
          style={{ border: 'none', borderRadius: '8px' }}
          title="PDF Certificate"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load PDF in iframe');
          }}
        />
      </div>
    );
  };

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
                onClick={() => navigate('/')}
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
                {viewMethod}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMethod(viewMethod === 'react-pdf' ? 'iframe' : 'react-pdf')}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Switch View
              </button>
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
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <FaSpinner className="text-blue-500 text-6xl mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Loading PDF...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we load your certificate
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            {/* PDF Controls - only show for react-pdf method */}
            {viewMethod === 'react-pdf' && numPages && (
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Navigation Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => changePage(-1)}
                      disabled={pageNumber <= 1}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaArrowLeft />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Page</span>
                      <input
                        type="number"
                        min="1"
                        max={numPages || 1}
                        value={pageNumber}
                        onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center text-sm"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        of {numPages || '--'}
                      </span>
                    </div>

                    <button
                      onClick={() => changePage(1)}
                      disabled={pageNumber >= (numPages || 1)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <FaArrowRight />
                    </button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={zoomOut}
                      className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="Zoom Out"
                    >
                      <AiOutlineZoomOut />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      title="Zoom In"
                    >
                      <AiOutlineZoomIn />
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

            {/* PDF Document */}
            {renderPDFViewer()}
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