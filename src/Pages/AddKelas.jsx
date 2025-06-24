import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";
import { 
  FaLeaf, 
  FaChalkboardTeacher, 
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaGraduationCap,
  FaRecycle,
  FaUsers,
  FaLightbulb,
  FaSeedling,
  FaTree
} from "react-icons/fa";
import { MdScience, MdClass } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";
import { GiPlantSeed } from "react-icons/gi";

const AddKelas = () => {
  const [kelas, setKelas] = useState("");
  const [namaKelas, setNamaKelas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentColor, currentMode } = useStateContext();
  
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
    }
  }, [navigate]);

  const saveKelas = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("kelas", kelas);
    formData.append("namaKelas", namaKelas);

    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.post(
        `${apiUrl}/kelas`,
        jsonData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      navigate("/kelas");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaLeaf 
            className="absolute top-20 left-10 text-8xl animate-pulse" 
            style={{ color: currentColor }} 
          />
          <FaRecycle 
            className="absolute top-40 right-20 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1s' }} 
          />
          <GiPlantSeed 
            className="absolute bottom-40 left-20 text-7xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '0.5s' }} 
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
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <BsDoorOpen className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Buat <span style={{ color: currentColor }}>Eco Classroom</span> Baru
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
                  <FaChalkboardTeacher className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Form Eco Classroom</h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={saveKelas} className="space-y-8">
                  {/* Tingkat Kelas Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaGraduationCap style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Tingkat Pembelajaran
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Pilih Tingkat Kelas Green Science
                    </label>
                    <div className="relative">
                      <select
                        name="kelas"
                        required
                        className={`block w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600' 
                            : 'bg-white text-gray-900 border-gray-300'
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
                        value={kelas}
                        onChange={(e) => setKelas(e.target.value)}
                      >
                        <option value="">Pilih Tingkat Eco Learning</option>
                        <option value="10">Kelas 10 (X) - Green Science Foundation</option>
                        <option value="11">Kelas 11 (XI) - Advanced Green Learning</option>
                        <option value="12">Kelas 12 (XII) - Green Innovation</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <MdScience style={{ color: currentColor }} />
                      </div>
                    </div>
                  </div>

                  {/* Nama Kelas Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <BsDoorOpen style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Identitas Kelas
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Nama Eco Classroom
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="namaKelas"
                        required
                        placeholder="Contoh: X-1 Green Science, XI IPA 2 Eco Learning"
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
                        value={namaKelas}
                        onChange={(e) => setNamaKelas(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaLeaf style={{ color: currentColor }} className="animate-pulse" />
                      </div>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Berikan nama yang mencerminkan semangat Green Science Learning
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/kelas")}
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
                      {isSubmitting ? "Membuat Eco Class..." : "Buat Eco Classroom"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Class Preview */}
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
                  <MdClass style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Preview Kelas
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tingkat:
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {kelas ? `Kelas ${kelas}` : 'Belum dipilih'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Nama Kelas:
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {namaKelas || 'Belum diisi'}
                    </p>
                  </div>
                  {kelas && namaKelas && (
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

            {/* Green Learning Info */}
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
                      Green Science Integration
                    </h3>
                    <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Setiap eco classroom yang dibuat akan otomatis terintegrasi dengan:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaRecycle style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Modul Pengolahan Limbah Organik
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaLeaf style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Konsep Green Economy
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdScience style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Literasi Sains Berkelanjutan
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaSeedling style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Praktik Pembelajaran Ramah Lingkungan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Learning Outcomes */}
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
                <div className="flex items-center gap-2 mb-4">
                  <FaUsers style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Learning Outcomes
                  </h3>
                </div>
                <div className="space-y-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.05) }}
                  >
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Pemahaman IPA Berkelanjutan
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Siswa memahami konsep sains dengan pendekatan ramah lingkungan
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.05) }}
                  >
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Keterampilan Green Economy
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Mampu mengaplikasikan konsep ekonomi hijau dalam kehidupan
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.05) }}
                  >
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Kesadaran Lingkungan
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Berkembangnya sikap peduli dan bertanggung jawab terhadap lingkungan
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

export default AddKelas;