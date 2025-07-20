import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaCheck,
  FaArrowLeft,
  FaLayerGroup,
  FaQuestionCircle,
  FaLightbulb,
} from "react-icons/fa";
import { MdQuiz, MdBook, MdClass, MdAccessTime } from "react-icons/md";
import { BsListUl, BsGrid3X3Gap } from "react-icons/bs";
import { GiPlantSeed } from "react-icons/gi";

const ListSoal = () => {
  const [groupSoal, setGroupSoal] = useState([]);
  const [detailSoal, setDetailSoal] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDetailTerm, setSearchDetailTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSoalModal, setShowDeleteSoalModal] = useState(false);
  const [deleteSoalTarget, setDeleteSoalTarget] = useState(null);
  const [isDeletingSoal, setIsDeletingSoal] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDetailPage, setCurrentDetailPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [detailItemsPerPage] = useState(10);

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
      setError("Gagal memuat data grup soal");
    } finally {
      setLoading(false);
    }
  };

  const getDetailSoal = async (groupId) => {
    setLoadingDetail(true);
    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${apiUrl}/soal-by-group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetailSoal(response.data);
      setCurrentDetailPage(1);
    } catch (error) {
      console.error("Error fetching detail soal:", error);
      setError("Gagal memuat detail soal");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewDetail = (group) => {
    setSelectedGroup(group);
    getDetailSoal(group.id);
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
    setDetailSoal([]);
    setSearchDetailTerm("");
    setShowDeleteSoalModal(false);
    setDeleteSoalTarget(null);
  };

  const handleDeleteGroup = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${apiUrl}/group-soal/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroupSoal(groupSoal.filter((item) => item.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Gagal menghapus grup soal");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (group) => {
    setDeleteTarget(group);
    setShowDeleteModal(true);
  };

  const handleDeleteSoal = async () => {
    if (!deleteSoalTarget) return;

    setIsDeletingSoal(true);
    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${apiUrl}/soal/${deleteSoalTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh data soal setelah delete
      getDetailSoal(selectedGroup.id);
      setShowDeleteSoalModal(false);
      setDeleteSoalTarget(null);
    } catch (error) {
      console.error("Error deleting soal:", error);
      setError("Gagal menghapus soal");
    } finally {
      setIsDeletingSoal(false);
    }
  };

  const openDeleteSoalModal = (soal) => {
    setDeleteSoalTarget(soal);
    setShowDeleteSoalModal(true);
  };

  // Filter and sort functions
  const filteredGroupSoal = groupSoal.filter(
    (group) =>
      group.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.kelas?.namaKelas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDetailSoal = detailSoal.filter(
    (soal) =>
      soal.soal?.toLowerCase().includes(searchDetailTerm.toLowerCase()) ||
      soal.correctAnswer?.toLowerCase().includes(searchDetailTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroupItems = filteredGroupSoal.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredGroupSoal.length / itemsPerPage);

  const indexOfLastDetail = currentDetailPage * detailItemsPerPage;
  const indexOfFirstDetail = indexOfLastDetail - detailItemsPerPage;
  const currentDetailItems = filteredDetailSoal.slice(
    indexOfFirstDetail,
    indexOfLastDetail
  );
  const totalDetailPages = Math.ceil(
    filteredDetailSoal.length / detailItemsPerPage
  );

  const formatDuration = (minutes) => {
    if (!minutes) return "Tidak terbatas";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins}m`;
    }
    return `${mins} menit`;
  };

  if (selectedGroup) {
    return (
      <div className="min-h-screen p-6">
        {/* Background Pattern */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-5">
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div
              className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
              style={{
                backgroundColor: getColorWithOpacity(currentColor, 0.1),
                borderColor: getColorWithOpacity(currentColor, 0.2),
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToList}
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
                    <MdQuiz className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedGroup.judul}
                    </h1>
                    <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                      {selectedGroup.kelas?.namaKelas} •{" "}
                      {formatDuration(selectedGroup.durasi)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {detailSoal.length}
                    </div>
                    <div
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Total Soal
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/soal/add-soal/${selectedGroup.id}`)
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                        currentColor,
                        0.8
                      )} 100%)`,
                    }}
                  >
                    <FaPlus />
                    Tambah Soal
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div
              className="p-4 rounded-xl shadow-lg border"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                borderColor: getColorWithOpacity(currentColor, 0.2),
              }}
            >
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari soal..."
                  value={searchDetailTerm}
                  onChange={(e) => setSearchDetailTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                    isDark
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-white text-gray-900 border-gray-300"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          {/* Soal List */}
          {loadingDetail ? (
            <div className="text-center py-12">
              <div
                className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{
                  borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
                }}
              />
              <p
                className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Memuat soal...
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {currentDetailItems.map((soal, index) => (
                <motion.div
                  key={soal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl shadow-lg border overflow-hidden"
                  style={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    borderColor: getColorWithOpacity(currentColor, 0.2),
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: currentColor }}
                        >
                          {indexOfFirstDetail + index + 1}
                        </div>
                        <h3
                          className={`font-semibold ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Soal {indexOfFirstDetail + index + 1}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/soal/edit/${soal.id}`)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Soal"
                        >
                          <FaEdit style={{ color: currentColor }} />
                        </button>
                        <button
                          onClick={() => openDeleteSoalModal(soal)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                          title="Hapus Soal"
                        >
                          <FaTrash className="text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mb-4 p-4 rounded-lg ${
                        isDark ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`${
                          isDark ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {soal.soal}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      {["A", "B", "C", "D", "E"].map((option) => {
                        const optionText = soal[`option${option}`];
                        const isCorrect = soal.correctAnswer === option;
                        if (!optionText) return null;

                        return (
                          <div
                            key={option}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isCorrect
                                ? `border-green-500 bg-green-50 dark:bg-green-900/20`
                                : `border-gray-200 dark:border-gray-600 ${
                                    isDark ? "bg-gray-800" : "bg-white"
                                  }`
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isCorrect
                                    ? "bg-green-500 text-white"
                                    : `${
                                        isDark
                                          ? "bg-gray-700 text-gray-300"
                                          : "bg-gray-200 text-gray-700"
                                      }`
                                }`}
                              >
                                {option}
                              </span>
                              <span
                                className={`${
                                  isDark ? "text-gray-200" : "text-gray-700"
                                }`}
                              >
                                {optionText}
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
              ))}
            </motion.div>
          )}

          {/* Pagination for Detail */}
          {totalDetailPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center mt-6 gap-2"
            >
              <button
                onClick={() =>
                  setCurrentDetailPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentDetailPage === 1}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  currentDetailPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : `hover:bg-gray-50 dark:hover:bg-gray-700`
                } ${
                  isDark
                    ? "border-gray-600 text-gray-200"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalDetailPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentDetailPage(page)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      currentDetailPage === page
                        ? "text-white border-transparent"
                        : `${
                            isDark
                              ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`
                    }`}
                    style={
                      currentDetailPage === page
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

              <button
                onClick={() =>
                  setCurrentDetailPage((prev) =>
                    Math.min(prev + 1, totalDetailPages)
                  )
                }
                disabled={currentDetailPage === totalDetailPages}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  currentDetailPage === totalDetailPages
                    ? "opacity-50 cursor-not-allowed"
                    : `hover:bg-gray-50 dark:hover:bg-gray-700`
                } ${
                  isDark
                    ? "border-gray-600 text-gray-200"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                Next
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {showDeleteSoalModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className={`max-w-md w-full rounded-xl shadow-2xl p-6 ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaTrash className="text-red-500 text-2xl" />
                    </div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Hapus Soal
                    </h3>
                    <p
                      className={`${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Yakin ingin menghapus soal ini? Tindakan ini tidak dapat
                      dibatalkan.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteSoalModal(false)}
                      disabled={isDeletingSoal}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                        isDark
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDeleteSoal}
                      disabled={isDeletingSoal}
                      className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      {isDeletingSoal ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
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
            <div className="flex items-center justify-between">
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
                    Bank <span style={{ color: currentColor }}>Soal Green</span>
                  </h1>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Manajemen soal dan kuis pembelajaran Green Science
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <FaLayerGroup style={{ color: currentColor }} />
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {groupSoal.length}
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Grup Soal
                  </p>
                </div>

                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    }}
                  >
                    <FaQuestionCircle style={{ color: currentColor }} />
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {groupSoal.reduce(
                      (total, group) => total + (group.soals?.length || 0),
                      0
                    )}
                  </p>
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Soal
                  </p>
                </div>

                <button
                  onClick={() => navigate("/soal/add-group")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                      currentColor,
                      0.8
                    )} 100%)`,
                  }}
                >
                  <FaPlus />
                  Tambah Grup
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari grup soal atau kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                    isDark
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                  }`}
                  style={{
                    borderColor: getColorWithOpacity(currentColor, 0.3),
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setViewMode(viewMode === "card" ? "table" : "card")
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isDark
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {viewMode === "card" ? <BsListUl /> : <BsGrid3X3Gap />}
                  {viewMode === "card" ? "List" : "Grid"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{
                borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
              }}
            />
            <p className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
              Memuat bank soal green learners...
            </p>
          </motion.div>
        ) : currentGroupItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div
              className="p-6 rounded-xl mx-auto max-w-md"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <MdQuiz
                className="text-6xl mb-4 mx-auto opacity-50"
                style={{ color: currentColor }}
              />
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Belum ada grup soal
              </h3>
              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "Tidak ditemukan grup soal dengan kata kunci tersebut"
                  : "Mulai buat grup soal untuk pembelajaran Green Science"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/soal/add-group")}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300"
                  style={{ backgroundColor: currentColor }}
                >
                  Buat Grup Soal
                </button>
              )}
            </div>
          </motion.div>
        ) : viewMode === "card" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentGroupItems.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-xl"
                  style={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    borderColor: getColorWithOpacity(currentColor, 0.2),
                  }}
                >
                  {/* Card Header */}
                  <div
                    className="p-4"
                    style={{
                      background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                        currentColor,
                        0.8
                      )} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MdQuiz className="text-white text-lg" />
                        <span className="text-white font-semibold text-sm">
                          Green Quiz
                        </span>
                      </div>
                      <FaLayerGroup className="text-white text-lg" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3
                      className={`font-bold text-lg mb-2 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {group.judul}
                    </h3>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <MdBook
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-sm font-bold ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Modul: {group.modul?.judul || "-"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MdClass
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {group.kelas?.namaKelas || "Kelas tidak ditemukan"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MdAccessTime
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {formatDuration(group.durasi)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FaQuestionCircle
                          style={{ color: currentColor }}
                          className="text-sm"
                        />
                        <span
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {group.soals?.length || 0} soal
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => handleViewDetail(group)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                            currentColor,
                            0.8
                          )} 100%)`,
                        }}
                      >
                        <FaEye />
                        Detail
                      </button>
                      <button
                        onClick={() => navigate(`/soal/edit-group/${group.id}`)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isDark
                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => openDeleteModal(group)}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
          /* Table View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="overflow-hidden rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr
                    style={{
                      background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                        currentColor,
                        0.8
                      )} 100%)`,
                    }}
                  >
                    <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Judul Grup
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Durasi
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold text-sm uppercase tracking-wider">
                      Jumlah Soal
                    </th>
                    <th className="px-6 py-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentGroupItems.map((group, index) => (
                    <motion.tr
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-colors duration-200 ${
                        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MdQuiz
                            className="text-xs"
                            style={{ color: currentColor }}
                          />
                          {group.judul}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {group.modul?.judul || "-"}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {group.kelas?.namaKelas || "-"}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formatDuration(group.durasi)}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {group.soals?.length || 0} soal
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(group)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: getColorWithOpacity(
                                currentColor,
                                0.1
                              ),
                              color: currentColor,
                            }}
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/soal/edit-group/${group.id}`)
                            }
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: getColorWithOpacity(
                                currentColor,
                                0.1
                              ),
                              color: currentColor,
                            }}
                            title="Edit Grup"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(group)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 hover:scale-110"
                            title="Hapus Grup"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-between mt-6"
          >
            <div
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredGroupSoal.length)} dari{" "}
              {filteredGroupSoal.length} grup soal
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
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
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                      currentPage === page
                        ? "text-white border-transparent"
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

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
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
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full rounded-xl shadow-2xl p-6 ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-500 text-2xl" />
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Hapus Grup Soal
                </h3>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Yakin ingin menghapus grup soal "{deleteTarget?.judul}"? Semua
                  soal dalam grup ini akan ikut terhapus.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListSoal;
