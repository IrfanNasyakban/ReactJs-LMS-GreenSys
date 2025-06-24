/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";
import { 
  FaLeaf,
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaGraduationCap,
  FaRecycle,
  FaSeedling,
  FaTree,
  FaEdit,
} from "react-icons/fa";
import { MdScience, MdClass, MdUpdate } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";
import { GiPlantSeed } from "react-icons/gi";

const EditKelas = () => {
  const [kelas, setKelas] = useState("");
  const [namaKelas, setNamaKelas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState({ kelas: "", namaKelas: "" });
  
  const { currentColor, currentMode } = useStateContext();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 6);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getKelasById();
    } else {
      navigate("/login");
    }
  }, [navigate, id]);

  const getKelasById = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/kelas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const kelasData = response.data;
      setKelas(kelasData.kelas);
      setNamaKelas(kelasData.namaKelas);
      setOriginalData({ 
        kelas: kelasData.kelas, 
        namaKelas: kelasData.namaKelas 
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching kelas data:", error);
      setLoading(false);
      navigate("/kelas");
    }
  };

  const updateKelas = async (e) => {
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
      await axios.patch(`${apiUrl}/kelas/${id}`, jsonData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/kelas");
    } catch (error) {
      console.error("Error updating kelas:", error);
      setIsSubmitting(false);
    }
  };

  // Check if data has changed
  const hasChanges = kelas !== originalData.kelas || namaKelas !== originalData.namaKelas;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4"
              style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
            ></div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Memuat data eco classroom...
            </p>
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
          <FaTree 
            className="absolute top-60 left-1/3 text-5xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '2s' }} 
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
                <FaEdit className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Edit <span style={{ color: currentColor }}>Eco Classroom</span>
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
                className="py-1 px-8"
                style={{ 
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                }}
              >
                <div className="flex items-center gap-3">
                  <MdUpdate className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Update Eco Classroom</h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={updateKelas}>
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
                      Perbarui nama yang mencerminkan semangat Green Science Learning
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
                      disabled={isSubmitting || !hasChanges}
                      whileHover={{ scale: (isSubmitting || !hasChanges) ? 1 : 1.02 }}
                      whileTap={{ scale: (isSubmitting || !hasChanges) ? 1 : 0.98 }}
                      className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-grey transition-all duration-300 ${
                        (isSubmitting || !hasChanges) ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      {isSubmitting ? "Mengupdate..." : hasChanges ? "Update Eco Classroom" : "Tidak Ada Perubahan"}
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
                    Preview Update
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      Tingkat:
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {kelas ? `Kelas ${kelas}` : 'Belum dipilih'}
                      </p>
                      {kelas !== originalData.kelas && (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600">
                          Berubah
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                      Nama Kelas:
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {namaKelas || 'Belum diisi'}
                      </p>
                      {namaKelas !== originalData.namaKelas && (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600">
                          Berubah
                        </span>
                      )}
                    </div>
                  </div>
                  {hasChanges && (
                    <div className="pt-2">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                        Status:
                      </p>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: currentColor }}
                      >
                        ✓ Siap diupdate
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
                      Update Information
                    </h3>
                    <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Perubahan pada eco classroom akan mempertahankan integrasi dengan:
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
                          Data Siswa & Progress Learning
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

export default EditKelas;