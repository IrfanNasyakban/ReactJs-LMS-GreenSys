/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaEye,
  FaCertificate,
  FaAward,
  FaChartLine,
  FaBook,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const NilaiSaya = () => {
  const [siswaId, setSiswaId] = useState("");
  const [filteredNilai, setFilteredNilai] = useState([]);
  const [nilai, setNilai] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const { currentColor, currentMode } = useStateContext();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Helper functions
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === "Dark";

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "text-green-500";
    if (numScore >= 80) return "text-blue-500";
    if (numScore >= 70) return "text-yellow-500";
    if (numScore >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBadge = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 90)
      return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (numScore >= 80)
      return { label: "Good", color: "bg-blue-100 text-blue-800" };
    if (numScore >= 70)
      return { label: "Average", color: "bg-yellow-100 text-yellow-800" };
    if (numScore >= 60)
      return { label: "Fair", color: "bg-orange-100 text-orange-800" };
    return { label: "Poor", color: "bg-red-100 text-red-800" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Effects
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getProfileSiswa();
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (siswaId) {
      getNilaiByStudent();
    }
  }, [siswaId]);

  useEffect(() => {
    filterAndSearchNilai();
  }, [nilai, searchQuery]);

  // API Functions
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
      } else {
        console.error("Format data tidak sesuai:", response.data);
      }
    } catch (error) {
      console.error("Error mengambil profile siswa:", error);
    }
  };

  const getNilaiByStudent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/student-results/${siswaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNilai(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Filter and search functions
  const filterAndSearchNilai = () => {
    let filtered = nilai;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.groupSoal?.judul
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.groupSoal?.modul?.judul
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNilai(filtered);
  };

  const handleDetail = (nilaiId) => {
    navigate(`/detail-nilai/${nilaiId}`);
  };

  const handleCetakSertifikat = (modulId, nilaiId) => {
    navigate(`/cetak-sertifikat/${modulId}/${nilaiId}`);
  };

  // function untuk handle kerjakan ulang
  const handleKerjakanUlang = (groupSoalId) => {
    navigate(`/start-quiz/${groupSoalId}`);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNilai.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate statistics
  const averageScore =
    nilai.length > 0
      ? nilai.reduce((sum, item) => sum + parseFloat(item.skor), 0) /
        nilai.length
      : 0;

  const highestScore =
    nilai.length > 0
      ? Math.max(...nilai.map((item) => parseFloat(item.skor)))
      : 0;

  const totalQuizzes = nilai.length;

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="p-3 rounded-2xl text-white"
              style={{ backgroundColor: currentColor }}
            >
              <FaChartLine className="text-2xl" />
            </div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Nilai Saya
              </h1>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Lihat semua hasil kuis dan perkembangan belajar Anda
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div
            className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <FaAward style={{ color: currentColor }} className="text-2xl" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Rata-rata Nilai
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {averageScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <FaCertificate
                  style={{ color: currentColor }}
                  className="text-2xl"
                />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Nilai Tertinggi
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {highestScore.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <MdQuiz style={{ color: currentColor }} className="text-2xl" />
              </div>
              <div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Total Kuis
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {totalQuizzes}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-6 rounded-2xl shadow-lg mb-8 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kuis atau modul..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: currentColor }}
              ></div>
              <span
                className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Loading...
              </span>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map((item, index) => {
                const scoreBadge = getScoreBadge(item.skor);
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
                          {item.groupSoal?.judul || "N/A"}
                        </h3>
                        <p className="text-sm text-white/80">
                          {item.groupSoal?.modul?.judul || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      {/* Quiz Info & Score Display - Side by side layout */}
                      <div className="flex justify-between items-start mb-6">
                        {/* Left side - Quiz Info */}
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
                              <FaBook
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
                                className={`font-normal ${
                                  isDark ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {item.groupSoal?.durasi || "N/A"} menit
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
                              <MdQuiz
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
                                Soal
                              </p>
                              <p
                                className={`text-sm ${
                                  isDark ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {item.jumlahSoal} pertanyaan
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

                      {/* Score Badge */}
                      <div className="flex justify-center mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${scoreBadge.color}`}
                        >
                          {scoreBadge.label}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mb-4">
                        {/* Detail Button */}
                        <button
                          onClick={() => handleDetail(item.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-white text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105 group-hover:shadow-xl"
                          style={{
                            background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                              currentColor,
                              0.8
                            )} 100%)`,
                          }}
                        >
                          <FaEye className="text-xs" />
                          Detail
                        </button>

                        {/* Certificate Button - Only show if score >= 70 */}
                        {parseFloat(item.skor) >= 70 && (
                          <button
                            onClick={() =>
                              handleCetakSertifikat(item.groupSoal.modul.id, item.id)
                            }
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105 border ${
                              isDark
                                ? "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <FaCertificate className="text-xs" />
                            Sertifikat
                          </button>
                        )}

                        {/* Retake Button - Only show if score < 70 */}
                        {parseFloat(item.skor) < 70 && (
                          <button
                            onClick={() => handleKerjakanUlang(item.groupSoalId)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105 bg-orange-500 text-white hover:bg-orange-600"
                          >
                            Kerjakan Ulang
                          </button>
                        )}
                      </div>

                      {/* Date Footer */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
        )}

        {/* Empty State */}
        {!loading && currentItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="p-4 rounded-full"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <MdQuiz style={{ color: currentColor }} className="text-4xl" />
              </div>
              <h3
                className={`text-xl font-semibold ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Belum ada hasil kuis
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Mulai mengerjakan kuis untuk melihat hasil di sini
              </p>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              } ${isDark ? "text-white" : "text-gray-800"}`}
            >
              <AiOutlineLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPage === i + 1
                    ? "text-white"
                    : isDark
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={{
                  backgroundColor:
                    currentPage === i + 1 ? currentColor : "transparent",
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              } ${isDark ? "text-white" : "text-gray-800"}`}
            >
              <AiOutlineRight />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NilaiSaya;