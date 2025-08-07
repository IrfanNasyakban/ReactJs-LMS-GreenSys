import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaTimes,
  FaArrowLeft,
  FaLightbulb,
  FaCheck,
  FaEye,
  FaEdit,
  FaInfoCircle,
  FaBook,
  FaUpload,
} from "react-icons/fa";
import {
  MdQuiz,
  MdLibraryBooks,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
  MdUpdate,
  MdAutoStories,
} from "react-icons/md";
import { BsQuestionSquare, BsCheckCircle } from "react-icons/bs";
import { GiPlantSeed } from "react-icons/gi";

const EditSoal = () => {
  const [groupSoal, setGroupSoal] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [soal, setSoal] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionE, setOptionE] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Story feature states
  const [showStory, setShowStory] = useState(false);
  const [storyImage, setStoryImage] = useState(null);
  const [storyImagePreview, setStoryImagePreview] = useState("");
  const [storyText, setStoryText] = useState("");
  const [judul, setJudul] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState(""); // For existing image URL
  const [removeImage, setRemoveImage] = useState(false); // Flag to remove image

  const fileInputRef = useRef(null);
  const { currentColor, currentMode } = useStateContext();

  const { id } = useParams(); // soalId
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === "Dark";

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    } else {
      getSoalById();
    }
  }, [navigate, id]);

  const getSoalById = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/soal/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      // Set original data for comparison
      setOriginalData(data);
      
      // Set form data
      setSoal(data.soal);
      setOptionA(data.optionA);
      setOptionB(data.optionB);
      setOptionC(data.optionC);
      setOptionD(data.optionD);
      setOptionE(data.optionE || "");
      setCorrectAnswer(data.correctAnswer);
      
      // Set story data
      setJudul(data.judul || "");
      setStoryText(data.cerita || "");
      
      // Handle existing story image - API menggunakan field 'image' dan 'url'
      if (data.image && data.url) {
        setExistingImageUrl(data.image); // Simpan nama file
        setStoryImagePreview(data.url); // Gunakan URL lengkap dari API
      } else {
        // Reset jika tidak ada gambar
        setExistingImageUrl("");
        setStoryImagePreview("");
      }
      
      // Show story section if there's story data
      if (data.judul || data.cerita || data.image) {
        setShowStory(true);
      }
      
      // Set group info if available
      if (data.groupSoal) {
        setGroupSoal(data.groupSoal);
      }
      
      setError("");
    } catch (error) {
      console.error("Error fetching soal:", error);
      setError("Gagal memuat data soal");
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Client-side validation
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
      
      // Check file size
      if (file.size > maxSize) {
        setError("Ukuran gambar harus kurang dari 10 MB");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError("Format file harus PNG, JPG, JPEG, atau GIF");
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous errors
      setError("");
      
      setStoryImage(file);
      setRemoveImage(false); // Reset remove flag when uploading new image
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image completely
  const handleRemoveImage = () => {
    setStoryImage(null);
    setStoryImagePreview("");
    setRemoveImage(true); // Flag to indicate image should be removed
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cancel new image upload (revert to existing)
  const cancelImageChange = () => {
    setStoryImage(null);
    // Gunakan URL lengkap dari originalData jika ada
    if (originalData && originalData.url) {
      setStoryImagePreview(originalData.url);
    } else {
      setStoryImagePreview("");
    }
    setRemoveImage(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateSoal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      // Check if there are any image changes (new upload or removal)
      const hasImageChanges = storyImage || removeImage;
      
      if (!hasImageChanges && showStory) {
        // No image changes but story exists, send only text data as JSON
        await axios.patch(`${apiUrl}/soal/${id}`, {
          soal: soal,
          optionA: optionA,
          optionB: optionB,
          optionC: optionC,
          optionD: optionD,
          optionE: optionE,
          correctAnswer: correctAnswer,
          judul: judul || "",
          cerita: storyText || ""
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // Image changes detected or no story, use FormData
        const formData = new FormData();
        formData.append("soal", soal);
        formData.append("optionA", optionA);
        formData.append("optionB", optionB);
        formData.append("optionC", optionC);
        formData.append("optionD", optionD);
        formData.append("optionE", optionE);
        formData.append("correctAnswer", correctAnswer);

        // Add story data if exists
        if (showStory) {
          if (judul) {
            formData.append("judul", judul);
          }
          if (storyImage) {
            formData.append("file", storyImage);
          }
          if (storyText) {
            formData.append("cerita", storyText);
          }
          // If image was removed, send flag
          if (removeImage) {
            formData.append("removeImage", "true");
          }
        } else {
          // If story section is hidden, remove all story data
          formData.append("judul", "");
          formData.append("cerita", "");
          formData.append("removeImage", "true");
        }

        await axios.patch(`${apiUrl}/soal/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      
      navigate("/data-soal");
    } catch (error) {
      console.error("Error updating soal:", error);
      
      // Handle specific error messages from backend
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 422:
            // Validation errors (file size, file type, etc.)
            setError(data.msg || "Terjadi kesalahan validasi");
            break;
          case 404:
            setError("Soal tidak ditemukan");
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

  const handleCorrectAnswerChange = (option) => {
    setCorrectAnswer(option);
  };

  const validateForm = () => {
    return soal && optionA && optionB && optionC && optionD && correctAnswer;
  };

  const hasChanges = () => {
    if (!originalData) return false;
    return (
      soal !== originalData.soal ||
      optionA !== originalData.optionA ||
      optionB !== originalData.optionB ||
      optionC !== originalData.optionC ||
      optionD !== originalData.optionD ||
      (optionE || "") !== (originalData.optionE || "") ||
      correctAnswer !== originalData.correctAnswer ||
      (judul || "") !== (originalData.judul || "") ||
      (storyText || "") !== (originalData.cerita || "") ||
      storyImage !== null ||
      removeImage ||
      (!showStory && (originalData.judul || originalData.cerita || originalData.image))
    );
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Tidak terbatas";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins} menit`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${currentColor} transparent ${currentColor} ${currentColor}` }}
          />
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Memuat data soal...
          </p>
        </div>
      </div>
    );
  }

  if (error && !originalData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Terjadi Kesalahan
          </h3>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={() => navigate("/data-soal")}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: currentColor }}
          >
            Kembali ke Daftar Soal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <MdQuiz
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <FaLightbulb
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "1s" }}
          />
          <GiPlantSeed
            className="absolute bottom-40 left-20 text-7xl animate-pulse"
            style={{ color: currentColor, animationDelay: "0.5s" }}
          />
        </div>
      </div>

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
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/data-soal")}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <FaArrowLeft className={isDark ? "text-white" : "text-gray-800"} />
              </button>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <FaEdit className="text-white text-2xl" />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Edit{" "}
                  <span style={{ color: currentColor }}>Soal Green</span>
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {groupSoal?.judul} • {groupSoal?.kelas?.namaKelas} • {formatDuration(groupSoal?.durasi)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              {/* Form Header */}
              <div
                className="py-6 px-8"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <BsQuestionSquare className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">
                    Edit Soal Green Science
                  </h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={updateSoal} className="space-y-8">
                  {/* Story Section */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MdAutoStories style={{ color: currentColor }} />
                        <h3
                          className={`font-semibold text-lg ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Cerita Soal (Opsional)
                        </h3>
                      </div>

                      <motion.button
                        type="button"
                        onClick={() => setShowStory(!showStory)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          showStory
                            ? "text-white border-transparent"
                            : `${
                                isDark
                                  ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                              } border`
                        }`}
                        style={
                          showStory
                            ? {
                                background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                                  currentColor,
                                  0.8
                                )} 100%)`,
                              }
                            : {}
                        }
                      >
                        <FaBook />
                        {showStory ? "Sembunyikan Cerita" : "Tampilkan Cerita"}
                      </motion.button>
                    </div>

                    {showStory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Judul */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-3 ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Judul Cerita
                          </label>

                          <div className="relative">
                            <input
                              type="text"
                              name="judul"
                              placeholder="Masukan Judul Cerita"
                              className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                                isDark
                                  ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                                  : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                              }`}
                              style={{
                                borderColor: getColorWithOpacity(
                                  currentColor,
                                  0.3
                                ),
                                boxShadow: `0 0 0 1px ${getColorWithOpacity(
                                  currentColor,
                                  0.1
                                )}`,
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = currentColor;
                                e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                                  currentColor,
                                  0.1
                                )}`;
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor =
                                  getColorWithOpacity(currentColor, 0.3);
                                e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                                  currentColor,
                                  0.1
                                )}`;
                              }}
                              value={judul}
                              onChange={(e) => setJudul(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-3 ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Gambar Cerita
                          </label>

                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />

                          {/* Current/New Image Display */}
                          {storyImagePreview && !removeImage && (
                            <div className="relative mb-4">
                              <div 
                                className="relative rounded-xl overflow-hidden border"
                                style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
                              >
                                <img
                                  src={storyImagePreview}
                                  alt="Story preview"
                                  className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                                  <FaEye className="text-white text-2xl" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {storyImage ? `Gambar baru: ${storyImage.name}` : 'Gambar saat ini'}
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
                                    {storyImage ? 'Ganti Lagi' : 'Ganti'}
                                  </button>
                                  {storyImage && (
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
                          {(!storyImagePreview || removeImage) && (
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
                                      // Gunakan URL lengkap dari originalData
                                      if (originalData && originalData.url) {
                                        setStoryImagePreview(originalData.url);
                                      } else {
                                        setStoryImagePreview("");
                                      }
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
                                    PNG, JPG, JPEG, GIF (MAX. 10MB)
                                  </p>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Story Text Editor */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-3 ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Teks Cerita
                          </label>

                          <textarea
                            rows="16"
                            placeholder="Tulis cerita yang menarik untuk memberikan konteks soal..."
                            className={`block w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none resize-none ${
                              isDark
                                ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-blue-500"
                                : "bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:border-blue-500"
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(
                                currentColor,
                                0.3
                              ),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(
                                currentColor,
                                0.1
                              )}`,
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                                currentColor,
                                0.1
                              )}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(
                                currentColor,
                                0.3
                              );
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                                currentColor,
                                0.1
                              )}`;
                            }}
                            value={storyText}
                            onChange={(e) => setStoryText(e.target.value)}
                          />

                          <p
                            className={`mt-2 text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Cerita dapat membantu siswa memahami konteks soal
                            dengan lebih baik. Gunakan bahasa yang menarik dan
                            mudah dipahami.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Pertanyaan Section */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MdQuiz style={{ color: currentColor }} />
                      <h3
                        className={`font-semibold text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Pertanyaan Soal
                      </h3>
                    </div>

                    <label
                      className={`block text-sm font-medium mb-3 ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Edit pertanyaan soal
                    </label>
                    <textarea
                      name="soal"
                      required
                      rows="4"
                      placeholder="Contoh: Apa yang dimaksud dengan Green Economy dalam konteks pembangunan berkelanjutan?"
                      className={`block w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none resize-none ${
                        isDark
                          ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                          : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                      }`}
                      style={{
                        borderColor: getColorWithOpacity(currentColor, 0.3),
                        boxShadow: `0 0 0 1px ${getColorWithOpacity(
                          currentColor,
                          0.1
                        )}`,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = currentColor;
                        e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                          currentColor,
                          0.1
                        )}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = getColorWithOpacity(
                          currentColor,
                          0.3
                        );
                        e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                          currentColor,
                          0.1
                        )}`;
                      }}
                      value={soal}
                      onChange={(e) => setSoal(e.target.value)}
                    />
                    <p
                      className={`mt-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Pastikan pertanyaan jelas dan sesuai dengan materi Green Science
                    </p>
                  </div>

                  {/* Opsi Jawaban Section */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MdLibraryBooks style={{ color: currentColor }} />
                      <h3
                        className={`font-semibold text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Edit Opsi Jawaban
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Option A */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange('A')}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === 'A' ? (
                              <MdRadioButtonChecked style={{ color: currentColor }} className="text-xl" />
                            ) : (
                              <MdRadioButtonUnchecked className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi A {correctAnswer === 'A' && <span style={{ color: currentColor }}>(Jawaban Benar)</span>}
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan opsi jawaban A"
                          className={`block w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
                            isDark
                              ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                          } ${correctAnswer === 'A' ? 'ring-2' : ''}`}
                          style={correctAnswer === 'A' ? {
                            borderColor: currentColor,
                            ringColor: getColorWithOpacity(currentColor, 0.3)
                          } : {}}
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                        />
                      </div>

                      {/* Option B */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange('B')}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === 'B' ? (
                              <MdRadioButtonChecked style={{ color: currentColor }} className="text-xl" />
                            ) : (
                              <MdRadioButtonUnchecked className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi B {correctAnswer === 'B' && <span style={{ color: currentColor }}>(Jawaban Benar)</span>}
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan opsi jawaban B"
                          className={`block w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
                            isDark
                              ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                          } ${correctAnswer === 'B' ? 'ring-2' : ''}`}
                          style={correctAnswer === 'B' ? {
                            borderColor: currentColor,
                            ringColor: getColorWithOpacity(currentColor, 0.3)
                          } : {}}
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                        />
                      </div>

                      {/* Option C */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange('C')}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === 'C' ? (
                              <MdRadioButtonChecked style={{ color: currentColor }} className="text-xl" />
                            ) : (
                              <MdRadioButtonUnchecked className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi C {correctAnswer === 'C' && <span style={{ color: currentColor }}>(Jawaban Benar)</span>}
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan opsi jawaban C"
                          className={`block w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
                            isDark
                              ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                          } ${correctAnswer === 'C' ? 'ring-2' : ''}`}
                          style={correctAnswer === 'C' ? {
                            borderColor: currentColor,
                            ringColor: getColorWithOpacity(currentColor, 0.3)
                          } : {}}
                          value={optionC}
                          onChange={(e) => setOptionC(e.target.value)}
                        />
                      </div>

                      {/* Option D */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange('D')}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === 'D' ? (
                              <MdRadioButtonChecked style={{ color: currentColor }} className="text-xl" />
                            ) : (
                              <MdRadioButtonUnchecked className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi D {correctAnswer === 'D' && <span style={{ color: currentColor }}>(Jawaban Benar)</span>}
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan opsi jawaban D"
                          className={`block w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
                            isDark
                              ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                          } ${correctAnswer === 'D' ? 'ring-2' : ''}`}
                          style={correctAnswer === 'D' ? {
                            borderColor: currentColor,
                            ringColor: getColorWithOpacity(currentColor, 0.3)
                          } : {}}
                          value={optionD}
                          onChange={(e) => setOptionD(e.target.value)}
                        />
                      </div>

                      {/* Option E */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange('E')}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === 'E' ? (
                              <MdRadioButtonChecked style={{ color: currentColor }} className="text-xl" />
                            ) : (
                              <MdRadioButtonUnchecked className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi E {correctAnswer === 'E' && <span style={{ color: currentColor }}>(Jawaban Benar)</span>} 
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}> (Opsional)</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Masukkan opsi jawaban E (opsional)"
                          className={`block w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
                            isDark
                              ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                          } ${correctAnswer === 'E' ? 'ring-2' : ''}`}
                          style={correctAnswer === 'E' ? {
                            borderColor: currentColor,
                            ringColor: getColorWithOpacity(currentColor, 0.3)
                          } : {}}
                          value={optionE}
                          onChange={(e) => setOptionE(e.target.value)}
                        />
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Klik radio button di sebelah opsi untuk menandai sebagai jawaban yang benar
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/data-soal")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-6 py-3 border rounded-xl text-sm font-medium transition-all duration-300 ${
                        isDark
                          ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <FaTimes />
                      Batal
                    </motion.button>

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-6 py-3 border rounded-xl text-sm font-medium transition-all duration-300 ${
                          showPreview
                            ? 'border-transparent text-white'
                            : `${isDark ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`
                        }`}
                        style={showPreview ? {
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                        } : {}}
                      >
                        <FaEye />
                        {showPreview ? 'Sembunyikan' : 'Preview'}
                      </motion.button>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !validateForm() || !hasChanges()}
                        whileHover={{ scale: isSubmitting || !validateForm() || !hasChanges() ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting || !validateForm() || !hasChanges() ? 1 : 0.98 }}
                        className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                          isSubmitting || !validateForm() || !hasChanges()
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:shadow-xl"
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                            currentColor,
                            0.8
                          )} 100%)`,
                        }}
                      >
                        <MdUpdate className={isSubmitting ? "animate-spin" : ""} />
                        {isSubmitting
                          ? "Memperbarui..."
                          : !hasChanges()
                          ? "Tidak Ada Perubahan"
                          : "Perbarui Soal"}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Group Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="p-4"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <MdQuiz style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Info Grup Soal
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
                      Judul Grup:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {groupSoal?.judul || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Kelas:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {groupSoal?.kelas?.namaKelas || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Durasi Quiz:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {formatDuration(groupSoal?.durasi)}
                    </p>
                  </div>
                  
                  {/* Status Perubahan */}
                  <div className="pt-2">
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } mb-2`}
                    >
                      Status:
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        hasChanges()
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          : "text-white"
                      }`}
                      style={!hasChanges() ? { backgroundColor: currentColor } : {}}
                    >
                      {hasChanges() ? "⚠ Ada Perubahan" : "✓ Tidak Ada Perubahan"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Preview Soal */}
            {showPreview && validateForm() && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
                }}
              >
                <div
                  className="p-4"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FaEye style={{ color: currentColor }} />
                    <h3
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Preview Soal
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  {/* Story Preview */}
                  {showStory && (judul || storyImagePreview || storyText) && !removeImage && (
                    <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <h4 className={`font-bold text-lg mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`} style={{ color: currentColor }}>
                        {judul || "Cerita Soal"}
                      </h4>
                      {storyImagePreview && (
                        <img
                          src={storyImagePreview}
                          alt="Story preview"
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      {storyText && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                          {storyText}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      {soal}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D', 'E'].map((option) => {
                      const optionValue = eval(`option${option}`);
                      const isCorrect = correctAnswer === option;
                      if (!optionValue) return null;
                      
                      return (
                        <div
                          key={option}
                          className={`p-3 rounded-lg border ${
                            isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : `border-gray-200 dark:border-gray-600 ${isDark ? 'bg-gray-800' : 'bg-white'}`
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCorrect
                                  ? 'bg-green-500 text-white'
                                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`
                              }`}
                            >
                              {option}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              {optionValue}
                            </span>
                            {isCorrect && (
                              <FaCheck className="text-green-500 text-sm ml-auto" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Change Summary */}
            {hasChanges() && originalData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
                }}
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaEdit style={{ color: currentColor }} />
                    <h3
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Perubahan yang Akan Disimpan
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {soal !== originalData.soal && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Pertanyaan diubah
                        </p>
                      </div>
                    )}
                    
                    {['A', 'B', 'C', 'D', 'E'].map((option) => {
                      const currentValue = eval(`option${option}`);
                      const originalValue = originalData[`option${option}`] || "";
                      if (currentValue !== originalValue && (currentValue || originalValue)) {
                        return (
                          <div key={option} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                              Opsi {option} diubah
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })}
                    
                    {correctAnswer !== originalData.correctAnswer && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Jawaban benar: {originalData.correctAnswer} → {correctAnswer}
                        </p>
                      </div>
                    )}

                    {(judul || "") !== (originalData.judul || "") && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Judul cerita diubah
                        </p>
                      </div>
                    )}

                    {(storyText || "") !== (originalData.cerita || "") && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Teks cerita diubah
                        </p>
                      </div>
                    )}

                    {storyImage && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Gambar cerita diubah
                        </p>
                      </div>
                    )}

                    {removeImage && (
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                          Gambar cerita dihapus
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 p-2 rounded-full"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <FaInfoCircle
                      className="h-5 w-5"
                      style={{ color: currentColor }}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold mb-2 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Tips Mengedit Soal
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <BsCheckCircle
                          style={{ color: currentColor }}
                          className="text-sm mt-0.5 flex-shrink-0"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Review perubahan sebelum menyimpan
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BsCheckCircle
                          style={{ color: currentColor }}
                          className="text-sm mt-0.5 flex-shrink-0"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Pastikan jawaban benar sudah tepat
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BsCheckCircle
                          style={{ color: currentColor }}
                          className="text-sm mt-0.5 flex-shrink-0"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Gunakan preview untuk mengecek tampilan
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BsCheckCircle
                          style={{ color: currentColor }}
                          className="text-sm mt-0.5 flex-shrink-0"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Cerita membantu siswa memahami konteks
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <BsCheckCircle
                          style={{ color: currentColor }}
                          className="text-sm mt-0.5 flex-shrink-0"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Gambar cerita bersifat opsional
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

export default EditSoal;