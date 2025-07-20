/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaEye,
  FaAward,
  FaChartLine,
  FaUser,
  FaCalendarAlt,
  FaFilter,
  FaTimes,
  FaLeaf,
  FaGraduationCap,
  FaTrophy,
  FaUsers,
  FaClock,
} from "react-icons/fa";
import { MdQuiz, MdDashboard } from "react-icons/md";
import { GiPlantSeed, GiEcology } from "react-icons/gi";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const ListDataNilai = () => {
  const [nilai, setNilai] = useState([]);
  const [filteredNilai, setFilteredNilai] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterByScore, setFilterByScore] = useState("");
  const [filterByClass, setFilterByClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    passedStudents: 0,
    totalQuizzes: 0,
  });

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

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
    if (token && user && (user.role === "admin" || user.role === "guru")) {
      getNilai();
    } else {
      navigate("/login");
    }
  }, [navigate, user]);

  useEffect(() => {
    filterNilai();
  }, [searchQuery, filterByScore, filterByClass, nilai]);

  const getNilai = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/all-results`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.data;
      setNilai(data);

      // Extract unique classes
      const uniqueClasses = [
        ...new Set(
          data.map((item) => item.siswa?.kelas?.namaKelas).filter(Boolean)
        ),
      ];
      setClasses(uniqueClasses);

      // Calculate statistics
      const totalStudents = new Set(data.map((item) => item.siswa?.id)).size;
      const averageScore =
        data.length > 0
          ? data.reduce((acc, item) => acc + parseFloat(item.skor), 0) /
            data.length
          : 0;
      const passedStudents = data.filter(
        (item) => parseFloat(item.skor) >= 70
      ).length;
      const totalQuizzes = new Set(data.map((item) => item.groupSoal?.id)).size;

      setStats({
        totalStudents,
        averageScore: Math.round(averageScore),
        passedStudents,
        totalQuizzes,
      });

      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const filterNilai = () => {
    let filtered = [...nilai];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.groupSoal?.judul
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.groupSoal?.modul?.judul
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.siswa?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by score range
    if (filterByScore) {
      filtered = filtered.filter((item) => {
        const score = parseFloat(item.skor);
        switch (filterByScore) {
          case "excellent":
            return score >= 90;
          case "good":
            return score >= 70 && score < 90;
          case "average":
            return score >= 60 && score < 70;
          case "poor":
            return score < 60;
          default:
            return true;
        }
      });
    }

    // Filter by class
    if (filterByClass) {
      filtered = filtered.filter(
        (item) => item.siswa?.kelas?.namaKelas === filterByClass
      );
    }

    setFilteredNilai(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "text-green-600";
    if (numScore >= 70) return "text-blue-600";
    if (numScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90)
      return {
        text: "Sangat Baik",
        bg: "bg-green-100 text-green-800",
        darkBg: "bg-green-900 text-green-200",
      };
    if (numScore >= 70)
      return {
        text: "Baik",
        bg: "bg-blue-100 text-blue-800",
        darkBg: "bg-blue-900 text-blue-200",
      };
    if (numScore >= 60)
      return {
        text: "Cukup",
        bg: "bg-yellow-100 text-yellow-800",
        darkBg: "bg-yellow-900 text-yellow-200",
      };
    return {
      text: "Perlu Perbaikan",
      bg: "bg-red-100 text-red-800",
      darkBg: "bg-red-900 text-red-200",
    };
  };

  const handleDetail = (id) => {
    navigate(`/detail-nilai/${id}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterByScore("");
    setFilterByClass("");
    setShowFilter(false);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNilai.slice(indexOfFirstItem, indexOfLastItem);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <FaAward
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "1s" }}
          />
          <GiPlantSeed
            className="absolute bottom-40 left-20 text-7xl animate-pulse"
            style={{ color: currentColor, animationDelay: "0.5s" }}
          />
          <FaChartLine
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
              background: `linear-gradient(135deg, ${getColorWithOpacity(
                currentColor,
                0.15
              )} 0%, ${getColorWithOpacity(currentColor, 0.05)} 100%)`,
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
              <div className="flex items-center gap-6 mb-6">
                <div
                  className="p-4 rounded-2xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                      currentColor,
                      0.8
                    )} 100%)`,
                  }}
                >
                  <MdDashboard className="text-white text-3xl" />
                </div>
                <div>
                  <h1
                    className={`text-4xl font-bold mb-2 ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Dashboard
                    <span style={{ color: currentColor }}> Hasil Kuis</span>
                  </h1>
                  <p
                    className={`text-lg ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Kelola dan pantau hasil kuis seluruh siswa
                  </p>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <FaUsers
                      style={{ color: currentColor }}
                      className="text-2xl"
                    />
                  </div>
                  <div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.totalStudents}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Total Siswa
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <FaChartLine
                      style={{ color: currentColor }}
                      className="text-2xl"
                    />
                  </div>
                  <div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.averageScore}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Rata-rata Nilai
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <FaTrophy
                      style={{ color: currentColor }}
                      className="text-2xl"
                    />
                  </div>
                  <div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.passedStudents}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Nilai ≥ 70
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <MdQuiz
                      style={{ color: currentColor }}
                      className="text-2xl"
                    />
                  </div>
                  <div>
                    <p
                      className={`text-3xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {stats.totalQuizzes}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Total Kuis
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
                  placeholder="Cari siswa, kuis, atau modul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                style={
                  showFilter
                    ? {
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                          currentColor,
                          0.8
                        )} 100%)`,
                      }
                    : {}
                }
              >
                <FaFilter />
                Filter
              </button>

              {/* Clear Filters */}
              {(searchQuery || filterByScore || filterByClass) && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Filter Berdasarkan Nilai
                      </label>
                      <select
                        value={filterByScore}
                        onChange={(e) => setFilterByScore(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border transition-all ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                      >
                        <option value="">Semua Nilai</option>
                        <option value="excellent">Sangat Baik (90-100)</option>
                        <option value="good">Baik (70-89)</option>
                        <option value="average">Cukup (60-69)</option>
                        <option value="poor">Perlu Perbaikan (&lt;60)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Filter Berdasarkan Kelas
                      </label>
                      <select
                        value={filterByClass}
                        onChange={(e) => setFilterByClass(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border transition-all ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                      >
                        <option value="">Semua Kelas</option>
                        {classes.map((kelas) => (
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
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Memuat Data
            </h3>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Mengambil data hasil kuis...
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
              <FaChartLine
                className="text-8xl mb-6 mx-auto opacity-50"
                style={{ color: currentColor }}
              />
              <h3
                className={`text-2xl font-semibold mb-3 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {searchQuery || filterByScore || filterByClass
                  ? "Tidak Ditemukan"
                  : "Belum Ada Data"}
              </h3>
              <p
                className={`text-base mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchQuery || filterByScore || filterByClass
                  ? "Tidak ada data yang sesuai dengan filter Anda"
                  : "Belum ada hasil kuis yang tersedia"}
              </p>
              {(searchQuery || filterByScore || filterByClass) && (
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
            {/* Grid Cards */}
            {/* Grid Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {currentItems.map((item, index) => {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${
                        isDark ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      {/* Header dengan gradient */}
                      <div
                        className="relative p-6 text-white overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                            currentColor,
                            0.8
                          )} 100%)`,
                        }}
                      >
                        {/* Decorative circle */}
                        <div className="absolute top-0 right-0 w-24 h-24 opacity-20 transform translate-x-8 -translate-y-8">
                          <div className="w-full h-full bg-white rounded-full"></div>
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-xl font-bold mb-1 text-white">
                            {item.groupSoal?.modul?.judul || "N/A"}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        {/* Student Info & Score Display - Side by side layout */}
                        <div className="flex justify-between items-start mb-6">
                          {/* Left side - Student Info */}
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{
                                  backgroundColor: getColorWithOpacity(
                                    currentColor,
                                    0.1
                                  ),
                                }}
                              >
                                <FaUser
                                  style={{ color: currentColor }}
                                  className="text-lg"
                                />
                              </div>
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Siswa
                                </p>
                                <p
                                  className={`font-semibold ${
                                    isDark ? "text-white" : "text-gray-800"
                                  }`}
                                >
                                  {item.siswa?.nama || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{
                                  backgroundColor: getColorWithOpacity(
                                    currentColor,
                                    0.1
                                  ),
                                }}
                              >
                                <FaGraduationCap
                                  style={{ color: currentColor }}
                                  className="text-lg"
                                />
                              </div>
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Kelas
                                </p>
                                <p
                                  className={`font-semibold ${
                                    isDark ? "text-white" : "text-gray-800"
                                  }`}
                                >
                                  {item.siswa?.kelas?.namaKelas || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{
                                  backgroundColor: getColorWithOpacity(
                                    currentColor,
                                    0.1
                                  ),
                                }}
                              >
                                <FaClock
                                  style={{ color: currentColor }}
                                  className="text-lg"
                                />
                              </div>
                              <div>
                                <p
                                  className={`text-sm ${
                                    isDark ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  Durasi
                                </p>
                                <p
                                  className={`font-semibold ${
                                    isDark ? "text-white" : "text-gray-800"
                                  }`}
                                >
                                  {item.groupSoal?.durasi || "N/A"} menit
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right side - Score Display */}
                          <div
                            className="text-center p-4 rounded-xl ml-4"
                            style={{
                              backgroundColor: getColorWithOpacity(
                                currentColor,
                                0.05
                              ),
                            }}
                          >
                            <div
                              className={`text-3xl font-bold mb-1 ${getScoreColor(
                                item.skor
                              )}`}
                            >
                              {parseFloat(item.skor).toFixed(0)}
                            </div>
                            <div className="text-center">
                              <span
                                className={`text-xs ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {item.jumlahJawabanBenar}/{item.jumlahSoal}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleDetail(item.id)}
                          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 group-hover:shadow-xl"
                          style={{
                            background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                              currentColor,
                              0.8
                            )} 100%)`,
                          }}
                        >
                          <FaEye className="text-lg" />
                          Lihat Detail
                          <AiOutlineRight className="text-sm transition-transform group-hover:translate-x-1" />
                        </button>

                        {/* Date Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-center gap-2">
                            <FaCalendarAlt className="text-gray-400 text-xs" />
                            <span
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Menampilkan {indexOfFirstItem + 1} -{" "}
                  {Math.min(indexOfLastItem, filteredNilai.length)} dari{" "}
                  {filteredNilai.length} hasil
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                      currentPage === 1
                        ? `opacity-50 cursor-not-allowed ${
                            isDark
                              ? "border-gray-600 text-gray-400"
                              : "border-gray-300 text-gray-400"
                          }`
                        : `${
                            isDark
                              ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`
                    }`}
                  >
                    <AiOutlineLeft />
                    Sebelumnya
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2);
                      const page = startPage + i;

                      if (page > totalPages) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg border-2 transition-all duration-300 ${
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
                                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                                    currentColor,
                                    0.8
                                  )} 100%)`,
                                }
                              : {}
                          }
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                      currentPage === totalPages
                        ? `opacity-50 cursor-not-allowed ${
                            isDark
                              ? "border-gray-600 text-gray-400"
                              : "border-gray-300 text-gray-400"
                          }`
                        : `${
                            isDark
                              ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`
                    }`}
                  >
                    Selanjutnya
                    <AiOutlineRight />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListDataNilai;
