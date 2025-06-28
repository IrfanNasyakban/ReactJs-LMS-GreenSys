import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaPlay,
  FaQuestionCircle,
  FaLightbulb,
  FaClock,
  FaGraduationCap,
  FaLeaf,
  FaBookOpen,
  FaChevronRight,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { MdQuiz, MdClass, MdAccessTime, MdScience } from "react-icons/md";
import { GiPlantSeed, GiEcology } from "react-icons/gi";
import { BsGrid3X3Gap, BsListCheck } from "react-icons/bs";

const ListQuiz = () => {
  const [groupSoal, setGroupSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const { currentColor, currentMode } = useStateContext();
  const { user } = useSelector((state) => state.auth);
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
      getGroupSoal();
    }
  }, [navigate]);

  const getGroupSoal = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${apiUrl}/all-group-soal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupSoal(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching group soal:", error);
      setError("Gagal memuat data kuis");
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const filteredGroupSoal = groupSoal.filter((group) => {
    const matchesSearch = 
      group.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.kelas?.namaKelas?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesKelas = !filterKelas || group.kelas?.namaKelas === filterKelas;
    
    return matchesSearch && matchesKelas;
  });

  // Get unique kelas for filter
  const uniqueKelas = [...new Set(groupSoal.map(group => group.kelas?.namaKelas).filter(Boolean))];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGroupSoal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGroupSoal.length / itemsPerPage);

  const formatDuration = (minutes) => {
    if (!minutes) return "Tidak terbatas";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins} menit`;
  };

  const getDifficultyLevel = (soalCount) => {
    if (soalCount <= 5) return { level: "Mudah", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" };
    if (soalCount <= 10) return { level: "Sedang", color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/20" };
    return { level: "Sulit", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" };
  };

  const handleStartQuiz = (groupId) => {
    navigate(`/start-quiz/${groupId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterKelas("");
    setShowFilter(false);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <GiEcology
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
          <MdScience
            className="absolute bottom-20 right-40 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "2s" }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div
            className="relative p-8 rounded-3xl shadow-2xl backdrop-blur-sm border overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${getColorWithOpacity(currentColor, 0.15)} 0%, ${getColorWithOpacity(currentColor, 0.05)} 100%)`,
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <FaLeaf 
                className="w-full h-full rotate-12"
                style={{ color: currentColor }}
              />
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-6 mb-4">
                <div
                  className="p-4 rounded-2xl shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)` 
                  }}
                >
                  <MdQuiz className="text-white text-3xl" />
                </div>
                <div>
                  <h1
                    className={`text-4xl font-bold mb-2 ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Kuis <span style={{ color: currentColor }}>Green Science</span>
                  </h1>
                  <p
                    className={`text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Uji pengetahuan Anda tentang lingkungan dan keberlanjutan
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <BsListCheck style={{ color: currentColor }} className="text-xl" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {groupSoal.length}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Kuis Tersedia
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaQuestionCircle style={{ color: currentColor }} className="text-xl" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {groupSoal.reduce((total, group) => total + (group.soals?.length || 0), 0)}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Total Soal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaGraduationCap style={{ color: currentColor }} className="text-xl" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {uniqueKelas.length}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Tingkat Kelas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div
            className="p-6 rounded-2xl shadow-lg border"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kuis atau topik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                    isDark
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-blue-500"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                  showFilter
                    ? `border-transparent text-white`
                    : `${
                        isDark
                          ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                      }`
                }`}
                style={showFilter ? {
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                } : {}}
              >
                <FaFilter />
                Filter
              </button>

              {/* Clear Filters */}
              {(searchTerm || filterKelas) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <FaTimes />
                  Reset
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                >
                  <div className="flex flex-wrap gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Filter Kelas
                      </label>
                      <select
                        value={filterKelas}
                        onChange={(e) => setFilterKelas(e.target.value)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                      >
                        <option value="">Semua Kelas</option>
                        {uniqueKelas.map((kelas) => (
                          <option key={kelas} value={kelas}>
                            {kelas}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <FaTimes />
              {error}
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div
              className="w-20 h-20 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6"
              style={{
                borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
              }}
            />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
              Memuat Kuis
            </h3>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Mengambil data kuis terbaru untuk Anda...
            </p>
          </motion.div>
        ) : currentItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div
              className="p-8 rounded-2xl mx-auto max-w-md"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `2px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <MdQuiz
                className="text-8xl mb-6 mx-auto opacity-50"
                style={{ color: currentColor }}
              />
              <h3
                className={`text-2xl font-semibold mb-3 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {searchTerm || filterKelas ? "Tidak Ditemukan" : "Belum Ada Kuis"}
              </h3>
              <p
                className={`text-base mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchTerm || filterKelas
                  ? "Tidak ada kuis yang sesuai dengan pencarian Anda"
                  : "Belum ada kuis yang tersedia saat ini"}
              </p>
              {(searchTerm || filterKelas) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: currentColor }}
                >
                  Hapus Filter
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Quiz Cards Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8"
            >
              {currentItems.map((group, index) => {
                const difficulty = getDifficultyLevel(group.soals?.length || 0);
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative rounded-2xl shadow-xl overflow-hidden border transition-all duration-500 hover:shadow-2xl"
                    style={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    {/* Card Header with Gradient */}
                    <div
                      className="relative p-6 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <FaBookOpen className="text-2xl" />
                          <span className="font-semibold">Green Science</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficulty.bg} ${difficulty.color}`}>
                          {difficulty.level}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {group.judul}
                      </h3>

                      {/* Decorative Element */}
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                        <GiPlantSeed className="w-full h-full rotate-12" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Quiz Info */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                          >
                            <MdClass style={{ color: currentColor }} className="text-lg" />
                          </div>
                          <div>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              Kelas
                            </p>
                            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                              {group.kelas?.namaKelas || "Umum"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                          >
                            <FaClock style={{ color: currentColor }} className="text-lg" />
                          </div>
                          <div>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              Durasi
                            </p>
                            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                              {formatDuration(group.durasi)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                          >
                            <FaQuestionCircle style={{ color: currentColor }} className="text-lg" />
                          </div>
                          <div>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              Jumlah Soal
                            </p>
                            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                              {group.soals?.length || 0} Pertanyaan
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartQuiz(group.id)}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 group-hover:shadow-xl"
                        style={{
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                        }}
                      >
                        <FaPlay className="text-lg" />
                        Mulai Kuis
                        <FaChevronRight className="text-sm transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center justify-center gap-2"
              >
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                    currentPage === 1
                      ? `opacity-50 cursor-not-allowed ${
                          isDark ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-400"
                        }`
                      : `${
                          isDark
                            ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`
                  }`}
                >
                  Sebelumnya
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                        currentPage === page
                          ? "text-white border-transparent shadow-lg"
                          : `${
                              isDark
                                ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`
                      }`}
                      style={
                        currentPage === page
                          ? {
                              background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                            }
                          : {}
                      }
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                    currentPage === totalPages
                      ? `opacity-50 cursor-not-allowed ${
                          isDark ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-400"
                        }`
                      : `${
                          isDark
                            ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`
                  }`}
                >
                  Selanjutnya
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListQuiz;