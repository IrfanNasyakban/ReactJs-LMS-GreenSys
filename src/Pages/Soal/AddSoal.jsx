import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaLightbulb,
  FaPlus,
  FaBook,
  FaUpload,
} from "react-icons/fa";
import {
  MdQuiz,
  MdLibraryBooks,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
  MdTipsAndUpdates,
  MdAutoStories,
} from "react-icons/md";
import { BsQuestionSquare, BsCheckCircle } from "react-icons/bs";
import { GiPlantSeed } from "react-icons/gi";

const AddSoal = () => {
  const [groupSoal, setGroupSoal] = useState(null);
  const [soal, setSoal] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionE, setOptionE] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Story feature states
  const [showStory, setShowStory] = useState(false);
  const [storyImage, setStoryImage] = useState(null);
  const [storyImagePreview, setStoryImagePreview] = useState("");
  const [storyText, setStoryText] = useState("");
  const [judul, setJudul] = useState("");

  const fileInputRef = useRef(null);
  const { currentColor, currentMode } = useStateContext();

  const { id } = useParams(); // groupSoalId
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
      getGroupSoalDetails();
    }
  }, [navigate, id]);

  const getGroupSoalDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/group-soal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupSoal(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching group soal:", error);
      setError("Gagal memuat data grup soal");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 10MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar (PNG, JPG, GIF).");
        return;
      }

      setStoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(""); // Clear any previous errors
    }
  };

  const removeImage = () => {
    setStoryImage(null);
    setStoryImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveSoal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("soal", soal);
    formData.append("optionA", optionA);
    formData.append("optionB", optionB);
    formData.append("optionC", optionC);
    formData.append("optionD", optionD);
    formData.append("optionE", optionE);
    formData.append("correctAnswer", correctAnswer);
    formData.append("groupSoalId", id);

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
    }

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.post(`${apiUrl}/soal`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/data-soal");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setError("Gagal menyimpan soal");
      setIsSubmitting(false);
    }
  };

  const handleCorrectAnswerChange = (option) => {
    setCorrectAnswer(option);
  };

  const validateForm = () => {
    return soal && optionA && optionB && optionC && optionD && correctAnswer;
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

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
            }}
          />
          <p className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
            Memuat data grup soal...
          </p>
        </div>
      </div>
    );
  }

  if (error && !groupSoal) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-2xl" />
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Terjadi Kesalahan
          </h3>
          <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
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
                <FaArrowLeft
                  className={isDark ? "text-white" : "text-gray-800"}
                />
              </button>
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <FaPlus className="text-white text-2xl" />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Tambah <span style={{ color: currentColor }}>Soal Baru</span>
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {groupSoal?.judul} • {groupSoal?.kelas?.namaKelas} •{" "}
                  {formatDuration(groupSoal?.durasi)}
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
            {error}
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
                    Form Soal Green Science
                  </h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={saveSoal} className="space-y-8">
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
                        {showStory ? "Sembunyikan Cerita" : "Tambahkan Cerita"}
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
                        {/* Image Upload */}
                        <div>
                          <label
                            className={`block text-sm font-medium mb-3 ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Judul
                          </label>

                          <div className="relative">
                            <input
                              type="text"
                              name="judul"
                              required
                              placeholder="Masukan Judul"
                              className={`mb-3 block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
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

                          <label
                            className={`block text-sm font-medium mb-3 ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Gambar Cerita
                          </label>

                          {!storyImagePreview ? (
                            <div
                              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:border-opacity-80 ${
                                isDark
                                  ? "border-gray-600 bg-gray-800 hover:bg-gray-700"
                                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                              }`}
                              style={{
                                borderColor: getColorWithOpacity(
                                  currentColor,
                                  0.3
                                ),
                              }}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <FaUpload
                                className="mx-auto mb-3 text-3xl"
                                style={{ color: currentColor }}
                              />
                              <p
                                className={`text-lg font-medium ${
                                  isDark ? "text-gray-200" : "text-gray-700"
                                }`}
                              >
                                Klik untuk upload gambar
                              </p>
                              <p
                                className={`text-sm ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                PNG, JPG, GIF hingga 10MB
                              </p>
                            </div>
                          ) : (
                            <div className="relative">
                              <img
                                src={storyImagePreview}
                                alt="Story preview"
                                className="w-full h-64 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          )}

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
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
                      Tulis pertanyaan soal dengan jelas
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
                      Pastikan pertanyaan jelas dan sesuai dengan materi Green
                      Science
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
                        Opsi Jawaban
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Option A */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange("A")}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === "A" ? (
                              <MdRadioButtonChecked
                                style={{ color: currentColor }}
                                className="text-xl"
                              />
                            ) : (
                              <MdRadioButtonUnchecked
                                className={`text-xl ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi A{" "}
                            {correctAnswer === "A" && (
                              <span style={{ color: currentColor }}>
                                (Jawaban Benar)
                              </span>
                            )}
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
                          } ${correctAnswer === "A" ? "ring-2" : ""}`}
                          style={
                            correctAnswer === "A"
                              ? {
                                  borderColor: currentColor,
                                  ringColor: getColorWithOpacity(
                                    currentColor,
                                    0.3
                                  ),
                                }
                              : {}
                          }
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                        />
                      </div>

                      {/* Option B */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange("B")}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === "B" ? (
                              <MdRadioButtonChecked
                                style={{ color: currentColor }}
                                className="text-xl"
                              />
                            ) : (
                              <MdRadioButtonUnchecked
                                className={`text-xl ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi B{" "}
                            {correctAnswer === "B" && (
                              <span style={{ color: currentColor }}>
                                (Jawaban Benar)
                              </span>
                            )}
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
                          } ${correctAnswer === "B" ? "ring-2" : ""}`}
                          style={
                            correctAnswer === "B"
                              ? {
                                  borderColor: currentColor,
                                  ringColor: getColorWithOpacity(
                                    currentColor,
                                    0.3
                                  ),
                                }
                              : {}
                          }
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                        />
                      </div>

                      {/* Option C */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange("C")}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === "C" ? (
                              <MdRadioButtonChecked
                                style={{ color: currentColor }}
                                className="text-xl"
                              />
                            ) : (
                              <MdRadioButtonUnchecked
                                className={`text-xl ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi C{" "}
                            {correctAnswer === "C" && (
                              <span style={{ color: currentColor }}>
                                (Jawaban Benar)
                              </span>
                            )}
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
                          } ${correctAnswer === "C" ? "ring-2" : ""}`}
                          style={
                            correctAnswer === "C"
                              ? {
                                  borderColor: currentColor,
                                  ringColor: getColorWithOpacity(
                                    currentColor,
                                    0.3
                                  ),
                                }
                              : {}
                          }
                          value={optionC}
                          onChange={(e) => setOptionC(e.target.value)}
                        />
                      </div>

                      {/* Option D */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange("D")}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === "D" ? (
                              <MdRadioButtonChecked
                                style={{ color: currentColor }}
                                className="text-xl"
                              />
                            ) : (
                              <MdRadioButtonUnchecked
                                className={`text-xl ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi D{" "}
                            {correctAnswer === "D" && (
                              <span style={{ color: currentColor }}>
                                (Jawaban Benar)
                              </span>
                            )}
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
                          } ${correctAnswer === "D" ? "ring-2" : ""}`}
                          style={
                            correctAnswer === "D"
                              ? {
                                  borderColor: currentColor,
                                  ringColor: getColorWithOpacity(
                                    currentColor,
                                    0.3
                                  ),
                                }
                              : {}
                          }
                          value={optionD}
                          onChange={(e) => setOptionD(e.target.value)}
                        />
                      </div>

                      {/* Option E */}
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectAnswerChange("E")}
                            className="flex items-center gap-2"
                          >
                            {correctAnswer === "E" ? (
                              <MdRadioButtonChecked
                                style={{ color: currentColor }}
                                className="text-xl"
                              />
                            ) : (
                              <MdRadioButtonUnchecked
                                className={`text-xl ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            )}
                          </button>
                          <label
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            Opsi E{" "}
                            {correctAnswer === "E" && (
                              <span style={{ color: currentColor }}>
                                (Jawaban Benar)
                              </span>
                            )}
                            <span
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {" "}
                              (Opsional)
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="Masukkan opsi jawaban E (opsional)"
                          className={`block w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
                            isDark
                              ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                          } ${correctAnswer === "E" ? "ring-2" : ""}`}
                          style={
                            correctAnswer === "E"
                              ? {
                                  borderColor: currentColor,
                                  ringColor: getColorWithOpacity(
                                    currentColor,
                                    0.3
                                  ),
                                }
                              : {}
                          }
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
                      Klik radio button di sebelah opsi untuk menandai sebagai
                      jawaban yang benar
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
                        type="submit"
                        disabled={isSubmitting || !validateForm()}
                        whileHover={{
                          scale: isSubmitting || !validateForm() ? 1 : 1.02,
                        }}
                        whileTap={{
                          scale: isSubmitting || !validateForm() ? 1 : 0.98,
                        }}
                        className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                          isSubmitting || !validateForm()
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
                        <FaSave
                          className={isSubmitting ? "animate-spin" : ""}
                        />
                        {isSubmitting ? "Menyimpan..." : "Simpan Soal"}
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
                      {groupSoal?.judul}
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
                      {groupSoal?.kelas?.namaKelas}
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
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Total Soal Saat Ini:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {groupSoal?.soalCount || 0} soal
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
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
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 p-2 rounded-full"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <MdTipsAndUpdates
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
                      Tips Membuat Soal
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
                          Gunakan bahasa yang jelas dan mudah dipahami
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
                          Buat opsi jawaban yang masuk akal
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
                          Sesuaikan dengan materi Green Science
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
                          Tambahkan cerita untuk konteks yang menarik
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

export default AddSoal;
