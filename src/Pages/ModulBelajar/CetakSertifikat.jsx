import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaCertificate,
  FaCheckCircle,
  FaLeaf,
  FaSeedling,
  FaGlobeAmericas,
  FaRecycle,
  FaEye,
  FaExclamationTriangle,
  FaSpinner,
  FaCalendarAlt,
  FaUser,
  FaGraduationCap,
  FaExpand,
  FaImage,
} from "react-icons/fa";
import { MdEco, MdNature } from "react-icons/md";

const CetakSertifikat = () => {
  const [siswaId, setSiswaId] = useState(null);
  const [nama, setNama] = useState(null);
  const [judul, setJudul] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [certificateData, setCertificateData] = useState(null);
  
  // Image Certificate states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const { modulId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentColor, currentMode } = useStateContext();

  const isDark = currentMode === "Dark";
  const isSiswa = user?.role === "siswa";

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Green theme colors
  const greenTheme = {
    primary: "#10b981", // emerald-500
    secondary: "#34d399", // emerald-400
    accent: "#059669", // emerald-600
    light: "#d1fae5", // emerald-100
    dark: "#064e3b", // emerald-900
  };

  // Template URL - ganti dengan image (JPG/PNG)
  const templateUrl = `${process.env.REACT_APP_URL_API}/templates/certificate-template.jpg`;
  // Alternative: gunakan template local di public folder
  // const templateUrl = "/images/certificate-template.jpg";

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (!isSiswa) {
      navigate("/dashboard");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      getProfileSiswa();
      getModulById();
      checkExistingCertificate();
    } else {
      navigate("/login");
    }
  }, [navigate, isSiswa]);

  const getProfileSiswa = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/profile-siswa`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setSiswaId(profileData.id);
        setNama(profileData.nama);
      }
    } catch (error) {
      console.error("Error mengambil profile siswa:", error);
      setError("Gagal memuat data siswa");
    }
  };

  const getModulById = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/modul/${modulId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setJudul(response.data.judul);
    } catch (error) {
      console.error("Error fetching modul:", error);
      if (error.response?.status === 404) {
        setError("Modul tidak ditemukan!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError("Gagal memuat data modul");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkExistingCertificate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/certificate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check if certificate already exists for this module
      const existingCert = response.data.find(cert => 
        cert.modulId === parseInt(modulId) && cert.siswaId === siswaId
      );
      
      if (existingCert) {
        setCertificateData(existingCert);
      }
    } catch (error) {
      console.error("Error checking existing certificate:", error);
    }
  };

  // Generate certificate canvas
  const generateCertificateCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !nama || !judul) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to image size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Draw the background image
    ctx.drawImage(image, 0, 0);
    
    // Set text properties
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Draw nama siswa (center)
    ctx.font = 'bold 72px Times, serif';
    ctx.fillStyle = '#1e3a8a'; // blue-900
    ctx.textAlign = 'center';
    ctx.fillText(nama, canvas.width / 2, canvas.height * 0.5);

    // Draw judul modul (below nama)
    ctx.font = '48px Times, serif';
    ctx.fillStyle = '#374151'; // gray-700
    ctx.fillText(judul, canvas.width / 2, canvas.height * 0.6);

    // Draw tanggal (bottom right)
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = '#6b7280'; // gray-500
    ctx.textAlign = 'left';
    ctx.fillText(`Tanggal: ${currentDate}`, canvas.width * 0.65, canvas.height * 0.85);

    // Draw NIS if available
    if (user?.nis) {
      ctx.font = '20px Arial, sans-serif';
      ctx.fillStyle = '#9ca3af'; // gray-400
      ctx.fillText(`NIS: ${user.nis}`, canvas.width * 0.65, canvas.height * 0.88);
    }

    setCanvasReady(true);
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(null);
    generateCertificateCanvas();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError('Gagal memuat template certificate. Pastikan file template tersedia.');
  };

  // Update canvas when data changes
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete && nama && judul) {
      generateCertificateCanvas();
    }
  }, [nama, judul, user]);

  const generateCertificate = async () => {
    if (!siswaId || !modulId) {
      setError("Data siswa atau modul tidak lengkap");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      const response = await axios.post(
        `${apiUrl}/certificate`,
        {
          siswaId: siswaId,
          modulId: parseInt(modulId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCertificateData(response.data.certificate);
      setSuccess("Sertifikat berhasil digenerate!");
      
    } catch (error) {
      console.error("Error generating certificate:", error);
      if (error.response?.status === 400) {
        setError(error.response.data.msg || "Certificate sudah ada untuk modul ini");
      } else {
        setError("Gagal generate sertifikat. Silakan coba lagi.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!canvasReady || !canvasRef.current) {
      setError("Certificate belum siap untuk didownload");
      return;
    }

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `certificate-${nama}-${judul}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  const printCertificate = () => {
    if (!canvasReady || !canvasRef.current) {
      setError("Certificate belum siap untuk diprint");
      return;
    }

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Certificate" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Access denied for non-students
  if (!isSiswa) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-md">
            <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Akses Ditolak</h3>
            <p className="text-red-700 mb-4">
              Halaman ini hanya dapat diakses oleh siswa
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: `${greenTheme.primary} transparent ${greenTheme.primary} ${greenTheme.primary}`,
            }}
          />
          <p className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
            Memuat data sertifikat...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <FaLeaf className="absolute top-20 left-10 text-8xl animate-pulse text-green-500" />
          <MdEco className="absolute top-40 right-20 text-6xl animate-bounce text-green-400" />
          <FaSeedling className="absolute bottom-40 left-20 text-7xl animate-pulse text-green-600" />
          <FaGlobeAmericas className="absolute bottom-20 right-10 text-6xl animate-pulse text-blue-500" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors duration-300 ${
              isDark
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FaArrowLeft />
            Kembali ke Dashboard
          </button>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div
            className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
            style={{
              backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
              borderColor: getColorWithOpacity(greenTheme.primary, 0.2),
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: greenTheme.primary }}
              >
                <FaCertificate className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  <span style={{ color: greenTheme.primary }}>Cetak</span>{" "}
                  Sertifikat
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  GreenSys Learning Certificate - {judul}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FaImage className="text-green-500 text-2xl" />
                <FaRecycle className="text-blue-500 text-xl animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Certificate Preview */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl shadow-xl overflow-hidden mb-6"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(greenTheme.primary, 0.2)}`,
              }}
            >
              <div
                className="py-4 px-6"
                style={{
                  background: `linear-gradient(135deg, ${greenTheme.primary} 0%, ${greenTheme.secondary} 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaEye className="text-white text-xl" />
                    <h2 className="text-xl font-bold text-white">
                      Preview Sertifikat Real-time
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <FaExpand className="text-white text-sm" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Certificate Preview Container */}
                <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                  isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''
                }`}>
                  {imageLoading && (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <FaSpinner className="text-4xl text-gray-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Memuat template certificate...</p>
                      </div>
                    </div>
                  )}

                  {imageError && (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
                        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
                        <p className="text-red-700 mb-2 font-medium">Error Loading Template</p>
                        <p className="text-red-600 text-sm mb-4">
                          {imageError}
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setImageError(null);
                              setImageLoading(true);
                              if (imageRef.current) {
                                imageRef.current.src = templateUrl + '?t=' + Date.now();
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm mr-2"
                          >
                            Coba Lagi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!imageError && (
                    <div className="relative">
                      {/* Hidden image for loading template */}
                      <img
                        ref={imageRef}
                        src={templateUrl}
                        alt="Certificate Template"
                        style={{ display: 'none' }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        crossOrigin="anonymous"
                      />
                      
                      {/* Canvas for certificate generation */}
                      <canvas
                        ref={canvasRef}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxWidth: '100%',
                          border: '1px solid #e5e7eb'
                        }}
                        className="rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  {isFullscreen && (
                    <button
                      onClick={toggleFullscreen}
                      className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Certificate Info */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheckCircle className="text-green-600" />
                    <span className="font-medium text-green-800">
                      Preview Real-time Certificate
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Nama Siswa:</p>
                      <p className="font-medium text-gray-800">{nama}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Modul:</p>
                      <p className="font-medium text-gray-800">{judul}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tanggal:</p>
                      <p className="font-medium text-gray-800">
                        {new Date().toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Format:</p>
                      <p className="font-medium text-gray-800">
                        High Quality PNG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              {!certificateData ? (
                <motion.button
                  onClick={generateCertificate}
                  disabled={generating || !siswaId || !modulId || !canvasReady}
                  whileHover={{ scale: generating ? 1 : 1.02 }}
                  whileTap={{ scale: generating ? 1 : 0.98 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl ${
                    generating || !canvasReady
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${greenTheme.primary} 0%, ${greenTheme.accent} 100%)`,
                  }}
                >
                  {generating ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCertificate />
                  )}
                  {generating ? "Generating..." : "Generate Sertifikat"}
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={downloadCertificate}
                    disabled={!canvasReady}
                    whileHover={{ scale: canvasReady ? 1.02 : 1 }}
                    whileTap={{ scale: canvasReady ? 0.98 : 1 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl ${
                      !canvasReady ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${greenTheme.primary} 0%, ${greenTheme.accent} 100%)`,
                    }}
                  >
                    <FaDownload />
                    Download PNG
                  </motion.button>

                  <motion.button
                    onClick={printCertificate}
                    disabled={!canvasReady}
                    whileHover={{ scale: canvasReady ? 1.02 : 1 }}
                    whileTap={{ scale: canvasReady ? 0.98 : 1 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 border-2 ${
                      !canvasReady ? "opacity-70 cursor-not-allowed" : ""
                    } ${
                      isDark
                        ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900"
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    <FaPrint />
                    Print Certificate
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Info panels */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(greenTheme.primary, 0.2)}`,
              }}
            >
              <div
                className="p-4"
                style={{
                  backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <FaUser style={{ color: greenTheme.primary }} />
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Informasi Siswa
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Nama Lengkap:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {nama || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Role:
                    </p>
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-blue-500" />
                      <p
                        className={`font-medium ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Siswa
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Modul:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {judul || "Loading..."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Template Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(greenTheme.primary, 0.2)}`,
              }}
            >
              <div
                className="p-4"
                style={{
                  backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <FaImage style={{ color: greenTheme.primary }} />
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Template Info
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FaImage className="text-green-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Menggunakan template image yang lebih reliable
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaLeaf className="text-green-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Text otomatis ter-overlay dengan Canvas API
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaDownload className="text-blue-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Download sebagai PNG berkualitas tinggi
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaPrint className="text-blue-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Print langsung tanpa masalah browser
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-20 right-4 z-[9998] max-w-sm md:max-w-md"
            style={{ 
              zIndex: 9998,
            }}
          >
            <div
              className={`p-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
                error
                  ? "bg-red-50/95 border-red-200 text-red-800"
                  : "bg-green-50/95 border-green-200 text-green-800"
              }`}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1 rounded-full ${
                      error ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    {error ? (
                      <FaExclamationTriangle className="text-red-600 text-sm" />
                    ) : (
                      <FaCheckCircle className="text-green-600 text-sm" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {error ? "Error!" : "Success!"}
                    </p>
                    <p className="text-xs mt-1">{error || success}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                  }}
                  className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                    error
                      ? "hover:bg-red-600 text-red-600"
                      : "hover:bg-green-600 text-green-600"
                  }`}
                >
                  <FaArrowLeft className="text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CetakSertifikat;