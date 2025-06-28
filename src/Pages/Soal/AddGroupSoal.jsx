import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaQuestionCircle,
  FaInfoCircle,
  FaSave,
  FaTimes,
  FaGraduationCap,
  FaLayerGroup,
  FaLightbulb,
  FaAward,
} from "react-icons/fa";
import { 
  MdQuiz, 
  MdAccessTime,
  MdSchool,
} from "react-icons/md";
import { BsStopwatch, BsQuestionSquare } from "react-icons/bs";
import { GiPlantSeed } from "react-icons/gi";

const AddGroupSoal = () => {
  const [kelasList, setKelasList] = useState([]);
  const [judul, setJudul] = useState("");
  const [durasi, setDurasi] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentColor, currentMode } = useStateContext();

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

  // Get selected class info
  const selectedKelas = kelasList.find(k => k.id === parseInt(kelasId));

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getKelas();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const getKelas = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/kelas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKelasList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const saveGroupSoal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("judul", judul);
    formData.append("durasi", parseInt(durasi));
    formData.append("kelasId", kelasId);

    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.post(`${apiUrl}/group-soal`, jsonData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/data-soal");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setIsSubmitting(false);
    }
  };

  const formatDurationPreview = (minutes) => {
    if (!minutes) return "Belum diatur";
    const mins = parseInt(minutes);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}j ${remainingMins}m`;
    }
    return `${mins} menit`;
  };

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
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <MdQuiz className="text-white text-2xl" />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Buat{" "}
                  <span style={{ color: currentColor }}>Grup Soal</span>{" "}
                  Baru
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Green Science Quiz Management System - SMA 1 Lhokseumawe
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
                    Form Grup Soal Green Quiz
                  </h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={saveGroupSoal} className="space-y-8">
                  {/* Judul Section */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaLayerGroup style={{ color: currentColor }} />
                      <h3
                        className={`font-semibold text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Judul Grup Soal
                      </h3>
                    </div>

                    <label
                      className={`block text-sm font-medium mb-3 ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Nama Grup Soal
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="judul"
                        required
                        placeholder="Contoh: Kuis Green Science Bab 1, Evaluasi Eco Learning Semester 1"
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
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
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MdQuiz
                          style={{ color: currentColor }}
                          className="animate-pulse"
                        />
                      </div>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Berikan nama yang mencerminkan materi Green Science Learning
                    </p>
                  </div>

                  {/* Durasi Section */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <BsStopwatch style={{ color: currentColor }} />
                      <h3
                        className={`font-semibold text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Durasi Mengerjakan
                      </h3>
                    </div>

                    <label
                      className={`block text-sm font-medium mb-3 ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Waktu Pengerjaan (dalam menit)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="durasi"
                        required
                        min="1"
                        max="300"
                        placeholder="Contoh: 60, 90, 120"
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
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
                        value={durasi}
                        onChange={(e) => setDurasi(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MdAccessTime
                          style={{ color: currentColor }}
                          className="animate-pulse"
                        />
                      </div>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Durasi dalam menit (misal: 60 untuk 1 jam, 90 untuk 1.5 jam)
                    </p>
                  </div>

                  {/* Tingkat Kelas Section */}
                  <div
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaGraduationCap style={{ color: currentColor }} />
                      <h3
                        className={`font-semibold text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Target Kelas
                      </h3>
                    </div>

                    <label
                      className={`block text-sm font-medium mb-3 ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Pilih Kelas untuk Grup Soal
                    </label>
                    <div className="relative">
                      <select
                        name="kelasId"
                        required
                        className={`block w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
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
                        value={kelasId}
                        onChange={(e) => setKelasId(e.target.value)}
                      >
                        <option value="">Pilih Kelas</option>
                        {kelasList.map((kelas) => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.namaKelas}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MdSchool style={{ color: currentColor }} />
                      </div>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Grup soal akan tersedia untuk siswa di kelas yang dipilih
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

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                        isSubmitting
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
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      {isSubmitting
                        ? "Membuat Grup Soal..."
                        : "Buat Grup Soal"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quiz Preview */}
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
                    Preview Grup Soal
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
                      Judul:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {judul || "Belum diisi"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Durasi:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {formatDurationPreview(durasi)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Target Kelas:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedKelas?.namaKelas || "Belum dipilih"}
                    </p>
                  </div>
                  {judul && durasi && selectedKelas && (
                    <div className="pt-2">
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        } mb-2`}
                      >
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

            {/* Green Quiz Info */}
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
                      Green Quiz Features
                    </h3>
                    <p
                      className={`text-sm leading-relaxed mb-3 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Setiap grup soal yang dibuat akan memiliki fitur:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MdAccessTime
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Timer otomatis sesuai durasi
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaQuestionCircle
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Soal pilihan ganda interaktif
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaAward
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Penilaian otomatis real-time
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaLeaf
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Tema Green Science terintegrasi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
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
                  <FaLightbulb style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Langkah Selanjutnya
                  </h3>
                </div>
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: currentColor }}
                      >
                        1
                      </span>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Buat Grup Soal
                      </p>
                    </div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } ml-7`}
                    >
                      Lengkapi form ini dan simpan grup soal
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: currentColor }}
                      >
                        2
                      </span>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Tambah Soal
                      </p>
                    </div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } ml-7`}
                    >
                      Mulai menambahkan soal-soal ke dalam grup
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: currentColor }}
                      >
                        3
                      </span>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Aktivasi
                      </p>
                    </div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      } ml-7`}
                    >
                      Aktivasi grup soal untuk siswa
                    </p>
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

export default AddGroupSoal;