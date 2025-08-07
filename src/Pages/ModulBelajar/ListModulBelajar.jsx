import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLeaf,
  FaBook,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaLightbulb,
  FaSeedling,
  FaFileAlt,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { MdLibraryBooks } from "react-icons/md";
import { BsGrid3X3Gap } from "react-icons/bs";

const ListModulBelajar = () => {
  const [modulList, setModulList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedModul, setSelectedModul] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    fetchModulList();
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchModulList = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/modul`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModulList(response.data);
    } catch (error) {
      console.error("Error fetching modul list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.delete(`${apiUrl}/modul/${selectedModul.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModulList(modulList.filter((modul) => modul.id !== selectedModul.id));
      setShowDeleteModal(false);
      setSelectedModul(null);
    } catch (error) {
      console.error("Error deleting modul:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredModuls = modulList.filter(
    (modul) =>
      modul.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modul.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="rounded-xl shadow-lg overflow-hidden animate-pulse"
          style={{ backgroundColor: isDark ? "#1f2937" : "#ffffff" }}
        >
          <div
            className="h-48 w-full"
            style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
          />
          <div className="p-4 space-y-3">
            <div
              className="h-4 rounded"
              style={{
                backgroundColor: getColorWithOpacity(currentColor, 0.2),
              }}
            />
            <div
              className="h-3 rounded w-3/4"
              style={{
                backgroundColor: getColorWithOpacity(currentColor, 0.1),
              }}
            />
            <div
              className="h-3 rounded w-1/2"
              style={{
                backgroundColor: getColorWithOpacity(currentColor, 0.1),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaBook
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <MdLibraryBooks
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "1s" }}
          />
          <FaLightbulb
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
              backgroundColor: getColorWithOpacity(currentColor, 0.4),
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: currentColor }}
                >
                  <BsGrid3X3Gap className="text-white text-2xl" />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    <span style={{ color: currentColor }}>Modul Belajar</span>{" "}
                    Green Science
                  </h1>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Koleksi Modul Pembelajaran
                  </p>
                </div>
              </div>
              {user?.role !== "siswa" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/modul-belajar/add")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                      currentColor,
                      0.8
                    )} 100%)`,
                  }}
                >
                  <FaPlus />
                  Tambah Modul
                </motion.button>
              )}
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
            className="p-3 sm:p-4 lg:p-4 rounded-xl shadow-lg"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
            }}
          >
            {/* Mobile Layout (Stacked) */}
            <div className="flex flex-col gap-3 sm:hidden">
              {/* Search Input */}
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"
                  style={{ color: currentColor }}
                />
                <input
                  type="text"
                  placeholder="Cari modul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-300 focus:outline-none ${
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
                />
              </div>

              {/* Results Count and Icon */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {filteredModuls.length} modul ditemukan
                </span>
                <div
                  className="p-1.5 rounded-lg"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <FaLeaf className="text-sm" style={{ color: currentColor }} />
                </div>
              </div>
            </div>

            {/* Tablet Layout (Single row with wrapped content) */}
            <div className="hidden sm:flex lg:hidden flex-col gap-3">
              {/* Search Input */}
              <div className="relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: currentColor }}
                />
                <input
                  type="text"
                  placeholder="Cari modul belajar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
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
                />
              </div>

              {/* Results Count and Icon */}
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {filteredModuls.length} modul ditemukan
                </span>
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <FaLeaf style={{ color: currentColor }} />
                </div>
              </div>
            </div>

            {/* Desktop Layout (Original horizontal layout) */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex-1 relative">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: currentColor }}
                />
                <input
                  type="text"
                  placeholder="Cari modul belajar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none ${
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
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {filteredModuls.length} modul ditemukan
                </span>
                <div
                  className="p-2 rounded-lg"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <FaLeaf style={{ color: currentColor }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modul Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : filteredModuls.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <FaBook className="text-4xl" style={{ color: currentColor }} />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {searchTerm ? "Modul tidak ditemukan" : "Belum ada modul"}
              </h3>
              <p
                className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-6`}
              >
                {searchTerm
                  ? `Tidak ada modul yang cocok dengan "${searchTerm}"`
                  : "Mulai dengan menambahkan modul belajar pertama Anda"}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/modul-belajar/add")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg text-white font-medium transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                      currentColor,
                      0.8
                    )} 100%)`,
                  }}
                >
                  <FaPlus />
                  Tambah Modul Pertama
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredModuls.map((modul, index) => (
                  <motion.div
                    key={modul.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="rounded-xl shadow-lg overflow-hidden group cursor-pointer transition-all duration-300"
                    style={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${getColorWithOpacity(
                        currentColor,
                        0.2
                      )}`,
                    }}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      {modul.image ? (
                        <img
                          src={modul.url}
                          alt={modul.judul}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            backgroundColor: getColorWithOpacity(
                              currentColor,
                              0.1
                            ),
                          }}
                        >
                          <FaBook
                            className="text-6xl"
                            style={{
                              color: getColorWithOpacity(currentColor, 0.3),
                            }}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />

                      {/* Floating Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
                          style={{ backgroundColor: currentColor }}
                        >
                          <FaLeaf className="inline mr-1" />
                          Green Science
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      <div className="mb-4">
                        <h3
                          className={`font-bold text-lg mb-2 ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {truncateText(modul.judul, 40)}
                        </h3>
                        <p
                          className={`text-sm leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {truncateText(modul.deskripsi, 80)}
                        </p>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="p-1 rounded"
                            style={{
                              backgroundColor: getColorWithOpacity(
                                currentColor,
                                0.1
                              ),
                            }}
                          >
                            <FaFileAlt
                              style={{ color: currentColor }}
                              className="text-xs"
                            />
                          </div>
                          <span
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Modul Digital
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaSeedling
                            style={{ color: currentColor }}
                            className="text-xs"
                          />
                          <span
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Eco Learning
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            navigate(`/modul-belajar/detail/${modul.id}`)
                          }
                          className={`${
                            user?.role === "siswa" ? "w-full" : "flex-1"
                          } flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                            isDark
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <FaEye className="text-xs" />
                          {user?.role === "siswa" ? "Lihat Modul" : "Detail"}
                        </motion.button>

                        {/* Only show Edit and Delete buttons if user is not a student */}
                        {user?.role !== "siswa" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                navigate(`/modul-belajar/edit/${modul.id}`)
                              }
                              className="p-2 rounded-lg text-white transition-all duration-300 hover:shadow-lg"
                              style={{
                                backgroundColor: getColorWithOpacity(
                                  currentColor,
                                  0.8
                                ),
                              }}
                            >
                              <FaEdit className="text-sm" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedModul(modul);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-lg bg-red-500 text-white transition-all duration-300 hover:bg-red-600 hover:shadow-lg"
                            >
                              <FaTrash className="text-sm" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ backgroundColor: isDark ? "#1f2937" : "#ffffff" }}
            >
              {/* Modal Header */}
              <div
                className="p-6"
                style={{ backgroundColor: getColorWithOpacity("#ef4444", 0.1) }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-500">
                    <FaTrash className="text-white" />
                  </div>
                  <h3
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Hapus Modul Belajar
                  </h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p
                  className={`mb-4 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Apakah Anda yakin ingin menghapus modul "
                  {selectedModul?.judul}"? Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedModul(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={isDeleting}
                  >
                    <FaTimes className="inline mr-1" />
                    Batal
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 ${
                      isDeleting
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <FaCheck className="inline mr-1" />
                        Ya, Hapus
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListModulBelajar;
