import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { motion } from "framer-motion";
import { useStateContext } from "../contexts/ContextProvider";
import {
  FaEdit,
  FaEye,
  FaLeaf,
  FaUserGraduate,
  FaSearch,
  FaDownload,
  FaAward,
  FaCalendarAlt,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUsers,
  FaCertificate,
  FaGraduationCap,
  FaLightbulb,
  FaSeedling,
  FaRecycle,
  FaFileAlt,
  FaExternalLinkAlt,
  FaPrint,
  FaShare,
} from "react-icons/fa";
import { 
  MdScience, 
  MdEco, 
  MdNaturePeople,
  MdLibraryBooks,
  MdSchool,
  MdDateRange,
} from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";
import { BsFileEarmarkPdf, BsCollection, BsCalendar3 } from "react-icons/bs";

const ListCertificate = () => {
  const [certificate, setCertificate] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterByDate, setFilterByDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.auth);

  const isDark = currentMode === "Dark";

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getCertificate();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    filterAndSortCertificates();
  }, [certificate, searchTerm, sortBy, sortOrder, filterByDate]);

  const getCertificate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/certificate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCertificate(response.data);
      console.log("Certificate data:", response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCertificates = () => {
    let filtered = [...certificate];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (cert) =>
          cert.siswa?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.siswa?.nis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.modul?.judul?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (filterByDate) {
      filtered = filtered.filter((cert) => {
        const certDate = new Date(cert.createdAt).toISOString().split('T')[0];
        return certDate === filterByDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "nama":
          aValue = a.siswa?.nama || "";
          bValue = b.siswa?.nama || "";
          break;
        case "nis":
          aValue = a.siswa?.nis || "";
          bValue = b.siswa?.nis || "";
          break;
        case "modul":
          aValue = a.modul?.judul || "";
          bValue = b.modul?.judul || "";
          break;
        case "date":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.siswa?.nama || "";
          bValue = b.siswa?.nama || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCertificates(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // ✅ FIXED: Updated to use proper PDF viewer route
  const handleViewCertificate = (url) => {
    if (url) {
      console.log("Opening PDF viewer for:", url);
      // Use the same route pattern as mentioned in documents
      navigate(`/pdf-viewer?pdfUrl=${encodeURIComponent(url)}`);
    } else {
      console.error("No certificate URL provided");
      alert("URL sertifikat tidak tersedia");
    }
  };

  // ✅ FIXED: Updated download function with proxy support
  const handleDownloadCertificate = async (url, studentName) => {
    if (!url) {
      alert("URL sertifikat tidak tersedia");
      return;
    }

    try {
      // Use proxy endpoint for consistent download behavior
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      const response = await fetch(`${apiUrl}/pdf-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl: url })
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Sertifikat_${studentName || 'Unknown'}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to direct download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sertifikat_${studentName || 'Unknown'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === "asc" ? 
      <FaSortUp style={{ color: currentColor }} /> : 
      <FaSortDown style={{ color: currentColor }} />;
  };

  return (
    <div className="min-h-screen p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <FaAward
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <FaLightbulb
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: '1s' }}
          />
          <MdLibraryBooks
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
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: currentColor }}
                >
                  <FaAward className="text-white text-2xl" />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Sertifikat <span style={{ color: currentColor }}>Green Learners</span>
                  </h1>
                  <p
                    className={`${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Manajemen sertifikat siswa pembelajar Green Science
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaCertificate style={{ color: currentColor }} />
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {certificate.length}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Sertifikat
                  </p>
                </div>
                
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaUsers style={{ color: currentColor }} />
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {new Set(certificate.map(cert => cert.siswa?.id)).size}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Siswa Bersertifikat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
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
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <FaSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari siswa, NIS, atau modul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                    isDark
                      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                      : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                  }`}
                  style={{
                    borderColor: getColorWithOpacity(currentColor, 0.3),
                    boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = currentColor;
                    e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                    e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                  }}
                />
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isDark
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <FaFilter />
                  Filter
                </button>
                
                <button
                  onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    isDark
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <BsCollection />
                  {viewMode === "card" ? "Tabel" : "Kartu"}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Urutkan berdasarkan:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      }`}
                    >
                      <option value="nama">Nama Siswa</option>
                      <option value="nis">NIS</option>
                      <option value="modul">Modul</option>
                      <option value="date">Tanggal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Urutan:
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      }`}
                    >
                      <option value="asc">A-Z / Terlama</option>
                      <option value="desc">Z-A / Terbaru</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Filter tanggal:
                    </label>
                    <input
                      type="date"
                      value={filterByDate}
                      onChange={(e) => setFilterByDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content Area */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: `${currentColor} transparent ${currentColor} ${currentColor}` }}
            />
            <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Memuat sertifikat green learners...
            </p>
          </motion.div>
        ) : currentItems.length === 0 ? (
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
              <FaAward
                className="text-6xl mb-4 mx-auto opacity-50"
                style={{ color: currentColor }}
              />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Tidak ada sertifikat ditemukan
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || filterByDate 
                  ? "Coba ubah filter pencarian Anda" 
                  : "Belum ada sertifikat yang diterbitkan"
                }
              </p>
            </div>
          </motion.div>
        ) : viewMode === "card" ? (
          /* Card View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentItems.map((cert, index) => (
              <motion.div
                key={cert.id}
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
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaAward className="text-white text-lg" />
                      <span className="text-white font-semibold text-sm">Sertifikat Green Science</span>
                    </div>
                    <BsFileEarmarkPdf className="text-white text-lg" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaGraduationCap style={{ color: currentColor }} className="text-sm" />
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {cert.siswa?.nama || "N/A"}
                      </h3>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      NIS: {cert.siswa?.nis || "N/A"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MdLibraryBooks style={{ color: currentColor }} className="text-sm" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Modul:
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {cert.modul?.judul || "N/A"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BsCalendar3 style={{ color: currentColor }} className="text-sm" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Diterbitkan:
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(cert.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => handleViewCertificate(cert.certificateUrl)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <FaEye />
                      Lihat
                    </button>
                    <button
                      onClick={() => handleDownloadCertificate(cert.certificateUrl, cert.siswa?.nama)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isDark
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <FaDownload />
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
                      background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                    }}
                  >
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("nis")}
                        className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider hover:text-gray-200 transition-colors"
                      >
                        NIS
                        {getSortIcon("nis")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("nama")}
                        className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider hover:text-gray-200 transition-colors"
                      >
                        Nama Siswa
                        {getSortIcon("nama")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("modul")}
                        className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider hover:text-gray-200 transition-colors"
                      >
                        Modul
                        {getSortIcon("modul")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button
                        onClick={() => handleSort("date")}
                        className="flex items-center gap-2 text-white font-semibold text-sm uppercase tracking-wider hover:text-gray-200 transition-colors"
                      >
                        Tanggal
                        {getSortIcon("date")}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-center text-white font-semibold text-sm uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((cert, index) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-colors duration-200 ${
                        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {cert.siswa?.nis || "-"}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <div className="flex items-center gap-2">
                          <FaGraduationCap
                            className="text-xs"
                            style={{ color: currentColor }}
                          />
                          {cert.siswa?.nama || "-"}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        <div className="flex items-center gap-2">
                          <MdLibraryBooks
                            className="text-xs"
                            style={{ color: currentColor }}
                          />
                          {cert.modul?.judul || "-"}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {formatDate(cert.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewCertificate(cert.certificateUrl)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: getColorWithOpacity(currentColor, 0.1),
                              color: currentColor,
                            }}
                            title="Lihat Sertifikat"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDownloadCertificate(cert.certificateUrl, cert.siswa?.nama)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: getColorWithOpacity(currentColor, 0.1),
                              color: currentColor,
                            }}
                            title="Download Sertifikat"
                          >
                            <FaDownload />
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
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCertificates.length)} dari {filteredCertificates.length} sertifikat
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === 1
                    ? `opacity-50 cursor-not-allowed ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-400'}`
                    : `${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
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
                        ? 'text-white border-transparent'
                        : `${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
                    }`}
                    style={currentPage === page ? {
                      background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                    } : {}}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                  currentPage === totalPages
                    ? `opacity-50 cursor-not-allowed ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-400'}`
                    : `${isDark ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ListCertificate;