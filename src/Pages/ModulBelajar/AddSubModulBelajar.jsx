/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import { 
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaRecycle,
  FaLightbulb,
  FaSeedling,
  FaImage,
  FaFileAlt,
  FaUpload,
  FaEye,
  FaArrowLeft,
  FaChevronRight,
  FaPlayCircle,
  FaYoutube,
  FaLayerGroup,
  FaFilePdf
} from "react-icons/fa";
import { MdLibraryBooks, MdDescription, MdSubdirectoryArrowRight } from "react-icons/md";
import { BsFileEarmarkText, BsCollection } from "react-icons/bs";

const AddSubModulBelajar = () => {
  const [subJudul, setSubJudul] = useState("");
  const [subDeskripsi, setSubDeskripsi] = useState("");
  const [urlYoutube, setUrlYoutube] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null); // New state for PDF
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modulInfo, setModulInfo] = useState(null);
  const [loadingModul, setLoadingModul] = useState(true);
  
  const { currentColor, currentMode } = useStateContext();
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null); // New ref for PDF input
  const { modulId } = useParams();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    } else {
      fetchModulInfo();
    }
  }, [navigate, modulId]);

  // Fetch modul info
  const fetchModulInfo = async () => {
    try {
      setLoadingModul(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      const response = await axios.get(`${apiUrl}/modul/${modulId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setModulInfo(response.data);
    } catch (error) {
      console.error("Error fetching modul info:", error);
      setError("Modul tidak ditemukan");
      setTimeout(() => {
        navigate("/modul-belajar");
      }, 2000);
    } finally {
      setLoadingModul(false);
    }
  };

  // Validate YouTube URL
  const validateYouTubeURL = (url) => {
    if (!url) return true; // Optional field
    const youtubRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
    return youtubRegex.test(url);
  };

  // Handle image upload with validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side validation
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      
      // Check file size
      if (file.size > maxSize) {
        setError("Ukuran gambar harus kurang dari 5 MB");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError("Format file harus PNG, JPG, atau JPEG");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous errors
      setError("");
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle PDF upload with validation
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side validation
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      
      // Check file size
      if (file.size > maxSize) {
        setError("Ukuran file PDF harus kurang dari 10 MB");
        if (pdfInputRef.current) {
          pdfInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (file.type !== 'application/pdf') {
        setError("File harus berformat PDF");
        if (pdfInputRef.current) {
          pdfInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous errors
      setError("");
      setPdfFile(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove PDF
  const removePdf = () => {
    setPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  };

  // Trigger file upload
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Trigger PDF upload
  const triggerPdfUpload = () => {
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
      pdfInputRef.current.click();
    }
  };

  // Close error/success message
  const closeMessage = () => {
    setError("");
    setSuccess("");
  };

  const saveSubModul = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Validation

    if (urlYoutube && !validateYouTubeURL(urlYoutube)) {
      setError("Link YouTube tidak valid. Format: https://youtube.com/watch?v=... atau https://youtu.be/...");
      setIsSubmitting(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("subJudul", subJudul);
    formData.append("subDeskripsi", subDeskripsi);
    formData.append("urlYoutube", urlYoutube);
    formData.append("modulId", modulId);
    formData.append("file", image);
    
    // Add PDF file if selected
    if (pdfFile) {
      formData.append("pdfFile", pdfFile);
    }

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      await axios.post(
        `${apiUrl}/sub-modul`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      setSuccess("Sub modul berhasil dibuat!");
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate(`/modul-belajar/detail/${modulId}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      
      // Handle specific error messages from backend
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            setError(data.msg || "Data tidak valid");
            break;
          case 422:
            setError(data.msg || "Terjadi kesalahan validasi");
            break;
          case 401:
            setError("Sesi Anda telah berakhir. Silakan login kembali");
            setTimeout(() => {
              navigate("/login");
            }, 2000);
            break;
          case 500:
            setError("Terjadi kesalahan server. Silakan coba lagi");
            break;
          default:
            setError(data.msg || "Terjadi kesalahan tidak terduga");
        }
      } else if (error.request) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet Anda");
      } else {
        setError("Terjadi kesalahan tidak terduga");
      }
      
      setIsSubmitting(false);
    }
  };

  if (loadingModul) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div 
              className="h-32 rounded-2xl mb-8"
              style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
            />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div 
                  className="h-96 rounded-2xl"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                />
              </div>
              <div className="space-y-6">
                <div 
                  className="h-48 rounded-xl"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                />
                <div 
                  className="h-32 rounded-xl"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <BsCollection 
            className="absolute top-20 left-10 text-8xl animate-pulse" 
            style={{ color: currentColor }} 
          />
          <FaLightbulb 
            className="absolute top-40 right-20 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1s' }} 
          />
          <MdLibraryBooks 
            className="absolute bottom-40 left-20 text-7xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '0.5s' }} 
          />
        </div>
      </div>

      {/* Floating Notification */}
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div 
            className={`p-4 rounded-xl shadow-xl border ${
              error 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1 rounded-full ${
                  error ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  {error ? (
                    <FaTimes className="text-red-600 text-sm" />
                  ) : (
                    <FaSave className="text-green-600 text-sm" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {error ? 'Error!' : 'Berhasil!'}
                  </p>
                  <p className="text-xs mt-1">
                    {error || success}
                  </p>
                </div>
              </div>
              <button
                onClick={closeMessage}
                className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                  error 
                    ? 'hover:bg-red-600 text-red-600' 
                    : 'hover:bg-green-600 text-green-600'
                }`}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/modul-belajar")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <FaArrowLeft />
              Modul Belajar
            </button>
            <FaChevronRight className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            <button
              onClick={() => navigate(`/sub-modul-belajar/${modulId}`)}
              className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {modulInfo?.judul || 'Sub Modul'}
            </button>
            <FaChevronRight className={isDark ? 'text-gray-500' : 'text-gray-400'} />
            <span style={{ color: currentColor }} className="font-medium">
              Tambah Sub Modul
            </span>
          </div>
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
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <BsCollection className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Buat <span style={{ color: currentColor }}>Sub Modul</span> Baru
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {modulInfo ? `Modul: ${modulInfo.judul}` : 'Green Science Learning Management System'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl shadow-xl overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              {/* Form Header */}
              <div 
                className="py-6 px-8"
                style={{ 
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                }}
              >
                <div className="flex items-center gap-3">
                  <BsCollection className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Form Sub Modul Belajar</h2>
                  <MdSubdirectoryArrowRight className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-red-100 rounded-full">
                        <FaTimes className="text-red-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-red-800 font-medium text-sm">Terjadi Kesalahan!</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                      </div>
                      <button
                        onClick={() => setError("")}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* Success Alert */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-green-100 rounded-full">
                        <FaSave className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-green-800 font-medium text-sm">Berhasil!</p>
                        <p className="text-green-700 text-sm mt-1">{success}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={saveSubModul} className="space-y-8">
                  {/* Sub Judul Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaFileAlt style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Judul Sub Modul
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Nama Sub Modul Green Science
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="subJudul"
                        required
                        placeholder="Contoh: Bab 1 - Pengenalan Energi Terbarukan"
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                            : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        value={subJudul}
                        onChange={(e) => setSubJudul(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MdSubdirectoryArrowRight style={{ color: currentColor }} className="animate-pulse" />
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Berikan judul yang spesifik dan mudah dipahami untuk sub modul
                    </p>
                  </div>

                  {/* Sub Deskripsi Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MdDescription style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Deskripsi Sub Modul
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Penjelasan Detail Sub Modul
                    </label>
                    <div className="relative">
                      <textarea
                        name="subDeskripsi"
                        required
                        rows={5}
                        placeholder="Jelaskan isi sub modul, topik yang dibahas, dan materi pembelajaran yang akan dipelajari..."
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none resize-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                            : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        value={subDeskripsi}
                        onChange={(e) => setSubDeskripsi(e.target.value)}
                      />
                      <div className="absolute top-3 right-0 flex items-start pr-3 pointer-events-none">
                        <FaSeedling style={{ color: currentColor }} className="animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Link YouTube Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaYoutube style={{ color: '#FF0000' }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Link Video YouTube
                      </h3>
                      <span
                        className={`text-sm px-2 py-1 rounded text-white`}
                        style={{ backgroundColor: "#ef4444" }}
                      >
                        Wajib
                      </span>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Link Video Pembelajaran YouTube
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="urlYoutube"
                        placeholder="https://youtube.com/watch?v=... atau https://youtu.be/..."
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                            : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        value={urlYoutube}
                        onChange={(e) => setUrlYoutube(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaPlayCircle style={{ color: '#FF0000' }} className="animate-pulse" />
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tambahkan link video YouTube untuk memperkaya materi pembelajaran
                    </p>
                  </div>

                  {/* Upload Image Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaImage style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Gambar Cover Sub Modul
                      </h3>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        Opsional
                      </span>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Upload Gambar Cover Sub Modul
                    </label>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="image-upload"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {/* Upload Area */}
                    {!imagePreview ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={triggerFileUpload}
                          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300 hover:border-opacity-100 ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                          style={{
                            borderColor: getColorWithOpacity(currentColor, 0.3),
                          }}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaUpload 
                              className="mb-2 text-2xl" 
                              style={{ color: currentColor }}
                            />
                            <p className={`mb-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                              <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              PNG, JPG, JPEG (MAX. 5MB)
                            </p>
                          </div>
                        </button>
                      </div>
                    ) : (
                      /* Image Preview */
                      <div className="relative">
                        <div 
                          className="relative rounded-xl overflow-hidden border"
                          style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                            <FaEye className="text-white text-2xl" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {image?.name}
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={triggerFileUpload}
                              className={`px-3 py-1 text-xs rounded-lg transition-colors duration-300 ${
                                isDark 
                                  ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              Ganti
                            </button>
                            <button
                              type="button"
                              onClick={removeImage}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      ⚠️ Gambar cover opsional diupload untuk sub modul
                    </p>
                  </div>

                  {/* Upload PDF Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaFilePdf style={{ color: '#dc2626' }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        File PDF Materi
                      </h3>
                      <span className={`text-sm px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        Opsional
                      </span>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Upload File PDF Materi Pembelajaran
                    </label>

                    {/* Hidden PDF input */}
                    <input
                      ref={pdfInputRef}
                      type="file"
                      id="pdf-upload"
                      name="pdfFile"
                      accept=".pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />

                    {/* PDF Upload Area */}
                    {!pdfFile ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={triggerPdfUpload}
                          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all duration-300 hover:border-opacity-100 ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                          }`}
                          style={{
                            borderColor: getColorWithOpacity('#dc2626', 0.3),
                          }}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FaFilePdf 
                              className="mb-2 text-2xl text-red-600"
                            />
                            <p className={`mb-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                              <span className="font-semibold">Klik untuk upload PDF</span> atau drag & drop
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              PDF (MAX. 10MB)
                            </p>
                          </div>
                        </button>
                      </div>
                    ) : (
                      /* PDF Preview */
                      <div className="relative">
                        <div 
                          className="flex items-center p-4 rounded-xl border bg-red-50"
                          style={{ borderColor: getColorWithOpacity('#dc2626', 0.3) }}
                        >
                          <FaFilePdf className="text-red-600 text-2xl mr-3" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{pdfFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={triggerPdfUpload}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                            >
                              Ganti
                            </button>
                            <button
                              type="button"
                              onClick={removePdf}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      📄 Upload file PDF untuk materi pembelajaran tambahan
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate(`/modul-belajar/detail/${modulId}`)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-6 py-3 border rounded-xl text-sm font-medium transition-all duration-300 ${
                        isDark 
                          ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <FaTimes />
                      Batal
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      {isSubmitting ? "Membuat Sub Modul..." : "Buat Sub Modul"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Module Info */}
            {modulInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
                }}
              >
                <div 
                  className="p-4"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                >
                  <div className="flex items-center gap-2">
                    <FaLayerGroup style={{ color: currentColor }} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Modul Induk
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  {modulInfo.image && (
                    <div className="mb-4">
                      <img
                        src={modulInfo.url}
                        alt={modulInfo.judul}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Judul Modul:
                      </p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {modulInfo.judul}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Deskripsi Modul:
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {modulInfo.deskripsi ? (modulInfo.deskripsi.length > 100 ? `${modulInfo.deskripsi.substring(0, 100)}...` : modulInfo.deskripsi) : 'Tidak ada deskripsi'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sub Module Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              <div 
                className="p-4"
                style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
              >
                <div className="flex items-center gap-2">
                  <BsFileEarmarkText style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Preview Sub Modul
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Judul Sub Modul:
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {subJudul || 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Deskripsi:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {subDeskripsi ? (subDeskripsi.length > 100 ? `${subDeskripsi.substring(0, 100)}...` : subDeskripsi) : 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Link YouTube:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {urlYoutube ? '🎥 Video tersedia' : 'Tidak ada video'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      File PDF:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {pdfFile ? '📄 PDF tersedia' : 'Tidak ada PDF'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Gambar Cover:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {image ? '✓ Sudah diupload' : '❌ Wajib diupload'}
                    </p>
                  </div>
                  {subJudul && subDeskripsi && image && (
                    <div className="pt-2">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                        Status:
                      </p>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: currentColor }}
                      >
                        ✓ Siap dibuat
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Sub Module Guidelines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 p-2 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaInfoCircle 
                      className="h-5 w-5" 
                      style={{ color: currentColor }}
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Panduan Sub Modul
                    </h3>
                    <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Tips membuat sub modul berkualitas:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MdSubdirectoryArrowRight style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Judul spesifik dan berurutan (Bab 1, Bab 2, dst)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaImage style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Gambar cover opsional untuk setiap sub modul
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaYoutube style={{ color: '#FF0000' }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Video YouTube untuk pembelajaran visual
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaFilePdf style={{ color: '#dc2626' }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          File PDF untuk materi tambahan
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRecycle style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Konten yang mendukung green science
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubModulBelajar;