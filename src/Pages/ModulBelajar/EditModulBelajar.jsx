import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import { 
  FaLeaf, 
  FaBook, 
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaRecycle,
  FaUsers,
  FaLightbulb,
  FaSeedling,
  FaImage,
  FaFileAlt,
  FaUpload,
  FaEye,
  FaEdit
} from "react-icons/fa";
import { MdLibraryBooks, MdDescription } from "react-icons/md";
import { BsFileEarmarkText } from "react-icons/bs";

const EditModulBelajar = () => {
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { currentColor, currentMode } = useStateContext();
  const fileInputRef = useRef(null);
  
  const { id } = useParams();
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
      getModulById();
    }
  }, [navigate, id]);

  // Function untuk trigger file picker
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      // Reset value dulu
      fileInputRef.current.value = '';
      // Trigger click
      fileInputRef.current.click();
    }
  };

  // Handle image upload dengan validasi
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side validation
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      
      // Check file size
      if (file.size > maxSize) {
        setError("Ukuran gambar harus kurang dari 5 MB");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError("Format file harus PNG, JPG, atau JPEG");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous errors
      setError("");
      
      setImage(file);
      setRemoveImage(false); // Reset remove flag when uploading new image
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image completely
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveImage(true); // Flag to indicate image should be removed
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cancel new image upload (revert to existing)
  const cancelImageChange = () => {
    setImage(null);
    setImagePreview(existingImageUrl);
    setRemoveImage(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close error/success message
  const closeMessage = () => {
    setError("");
    setSuccess("");
  };

  const getModulById = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/modul/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const modulData = response.data;
      setJudul(modulData.judul);
      setDeskripsi(modulData.deskripsi);
      setExistingImageUrl(modulData.url);
      setImagePreview(modulData.url);
      
      console.log("Data modul:", modulData);
    } catch (error) {
      console.error("Error fetching modul:", error);
      if (error.response?.status === 404) {
        setError("Modul tidak ditemukan!");
        setTimeout(() => {
          navigate("/modul-belajar");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateModul = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(""); // Reset error
    setSuccess(""); // Reset success
    
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      // Check if there are any image changes (new upload or removal)
      const hasImageChanges = image || removeImage;
      
      if (!hasImageChanges) {
        // No image changes, send only text data as JSON
        await axios.patch(
          `${apiUrl}/modul/${id}`,
          {
            judul: judul,
            deskripsi: deskripsi
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Image changes detected (upload or removal), use FormData
        const formData = new FormData();
        formData.append("judul", judul);
        formData.append("deskripsi", deskripsi);
        
        // Add image file if uploading new image
        if (image) {
          formData.append("file", image);
        }
        
        // Add removeImage flag if user wants to remove image
        if (removeImage) {
          formData.append("removeImage", "true");
        }

        await axios.patch(
          `${apiUrl}/modul/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      
      setSuccess("Modul berhasil diperbarui!");
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate("/modul-belajar");
      }, 1500);
      
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      
      // Handle specific error messages from backend
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 422:
            // Validation errors (file size, file type, etc.)
            setError(data.msg || "Terjadi kesalahan validasi");
            break;
          case 404:
            setError("Modul tidak ditemukan");
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

  if (loading) {
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
          <FaBook 
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
                <FaEdit className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Edit <span style={{ color: currentColor }}>Modul Belajar</span>
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Green Science Learning Management System - SMA 1 Lhokseumawe
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
                  <FaEdit className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Edit Modul Belajar</h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
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

                <form onSubmit={updateModul} className="space-y-8">
                  {/* Judul Section */}
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
                        Judul Modul
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Nama Modul Green Science
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="judul"
                        required
                        placeholder="Contoh: Pengolahan Limbah Organik, Green Energy Solutions"
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
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaLeaf style={{ color: currentColor }} className="animate-pulse" />
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Berikan judul yang menarik dan mudah dipahami
                    </p>
                  </div>

                  {/* Deskripsi Section */}
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
                        Deskripsi Modul
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Penjelasan Detail Modul
                    </label>
                    <div className="relative">
                      <textarea
                        name="deskripsi"
                        required
                        rows={5}
                        placeholder="Jelaskan isi modul, tujuan pembelajaran, dan manfaatnya bagi siswa dalam konteks green science..."
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
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                      />
                      <div className="absolute top-3 right-0 flex items-start pr-3 pointer-events-none">
                        <FaSeedling style={{ color: currentColor }} className="animate-pulse" />
                      </div>
                    </div>
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
                        Gambar Modul
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Upload Gambar Cover Modul (Opsional)
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

                    {/* Current/New Image Display */}
                    {imagePreview && !removeImage && (
                      <div className="relative mb-4">
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
                            {image ? `New: ${image.name}` : 'Current image'}
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
                              {image ? 'Ganti Lagi' : 'Ganti'}
                            </button>
                            {image && (
                              <button
                                type="button"
                                onClick={cancelImageChange}
                                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300"
                              >
                                Batal
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Area - show if no image or image removed */}
                    {(!imagePreview || removeImage) && (
                      <div className="relative mb-4">
                        {removeImage && (
                          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              ⚠️ Gambar akan dihapus. Upload gambar baru atau batal untuk mempertahankan gambar yang ada.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setRemoveImage(false);
                                setImagePreview(existingImageUrl);
                              }}
                              className="mt-2 px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-300"
                            >
                              Batalkan Penghapusan
                            </button>
                          </div>
                        )}
                        
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
                    )}
                    
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 Tips: Klik "Ganti" untuk upload gambar baru, "Hapus" untuk menghapus gambar, atau biarkan kosong untuk mempertahankan gambar yang ada.
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/modul-belajar")}
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
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Module Preview */}
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
                  <BsFileEarmarkText style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Preview Modul
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {imagePreview && !removeImage && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {image && (
                      <p className={`text-xs mt-1 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        🔄 Gambar baru
                      </p>
                    )}
                  </div>
                )}
                {removeImage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className={`text-xs text-center text-red-600`}>
                      ❌ Gambar akan dihapus
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Judul:
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {judul || 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Deskripsi:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {deskripsi ? (deskripsi.length > 100 ? `${deskripsi.substring(0, 100)}...` : deskripsi) : 'Belum diisi'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Gambar:
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {removeImage 
                        ? '❌ Akan dihapus' 
                        : image 
                          ? '🔄 Akan diganti' 
                          : imagePreview 
                            ? '✓ Ada gambar' 
                            : 'Tidak ada gambar'
                      }
                    </p>
                  </div>
                  {judul && deskripsi && (
                    <div className="pt-2">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                        Status:
                      </p>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: currentColor }}
                      >
                        ✓ Siap disimpan
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Module Guidelines */}
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
                      Tips Edit Modul
                    </h3>
                    <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Panduan mengedit modul belajar:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaLeaf style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Perbarui konten sesuai feedback siswa
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaFileAlt style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Gambar bersifat opsional pada edit
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaImage style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Preview perubahan sebelum menyimpan
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRecycle style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Pertahankan nilai green science
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

export default EditModulBelajar;