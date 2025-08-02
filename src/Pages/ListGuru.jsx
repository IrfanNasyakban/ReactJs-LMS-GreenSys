import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { motion } from "framer-motion";
import { useStateContext } from "../contexts/ContextProvider";

import { 
  FaEdit, 
  FaTrash, 
  FaChalkboardTeacher,
  FaUsers,
  FaLeaf,
  FaSearch,
  FaFilter,
  FaDownload,
  FaCalendarAlt,
  FaUserTie,
  FaGraduationCap
} from "react-icons/fa";
import { MdScience, MdEco, MdNaturePeople } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const ListGuru = () => {
  const [guru, setGuru] = useState([]);
  const [filteredGuru, setFilteredGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getGuru();
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    filterGuruData();
  }, [guru, searchTerm, filterGender]);

  const getGuru = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/guru`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGuru(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const filterGuruData = () => {
    let filtered = guru;

    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterGender) {
      filtered = filtered.filter(g => g.gender === filterGender);
    }

    setFilteredGuru(filtered);
  };

  const formatTanggal = (tanggal) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", options);
  };

  const handleEdit = (id) => {
    navigate(`/guru/${id}`);
  };

  const handleDeleteGuru = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data guru ini?")) {
      try {
        const token = localStorage.getItem("accessToken");
        const apiUrl = process.env.REACT_APP_URL_API;
        await axios.delete(`${apiUrl}/guru/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        getGuru();
      } catch (error) {
        console.error("Error deleting guru:", error);
      }
    }
  };

  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaLeaf 
            className="absolute top-20 left-10 text-6xl animate-pulse" 
            style={{ color: currentColor }} 
          />
          <MdScience 
            className="absolute top-40 right-20 text-4xl animate-bounce" 
            style={{ color: currentColor }} 
          />
          <GiPlantSeed 
            className="absolute bottom-40 left-20 text-5xl animate-pulse" 
            style={{ color: currentColor }} 
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
                <FaChalkboardTeacher className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Green <span style={{ color: currentColor }}>Educators</span>
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Data guru pengajar Green Science - SMA 1 Lhokseumawe
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <div 
            className="p-6 rounded-xl shadow-lg backdrop-blur-sm border"
            style={{ 
              backgroundColor: getColorWithOpacity(currentColor, 0.05),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Cari nama, NIP, username, email..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  style={{ 
                    focusRingColor: getColorWithOpacity(currentColor, 0.5),
                    borderColor: getColorWithOpacity(currentColor, 0.3)
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Gender Filter */}
              <select
                className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="">Semua Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              {/* Spacer */}
              <div></div>

              {/* Export Button */}
              {/* <button
                className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: currentColor }}
              >
                <FaDownload />
                Export Data
              </button> */}
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="overflow-hidden rounded-xl shadow-lg backdrop-blur-sm border"
          style={{ 
            backgroundColor: getColorWithOpacity(currentColor, 0.05),
            borderColor: getColorWithOpacity(currentColor, 0.2)
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    NIP
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Nama
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Username
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Email
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    No Hp
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Gender
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Tanggal Lahir
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Foto
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div 
                          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
                          style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
                        ></div>
                        <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Loading green educators...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGuru.length > 0 ? (
                  filteredGuru.map((teacher, index) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-colors duration-200 ${
                        isDark 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {teacher.nip}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <FaLeaf className="text-xs" style={{ color: currentColor }} />
                          {teacher.nama}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {teacher.user?.username || "-"}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {teacher.email}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {teacher.noHp}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {teacher.gender}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatTanggal(teacher.tanggalLahir)}
                      </td>
                      <td className="px-6 py-4">
                        {(teacher.url && teacher.url !== "http://localhost:5000/images/null" && teacher.url !== `${process.env.REACT_APP_URL_API}/images/null`) ? (
                        <img
                          src={teacher.url}
                          alt={`Foto ${teacher.nama}`}
                          className="w-10 h-10 rounded-full object-cover border-2"
                          style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/40?text=No+Image";
                          }}
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                          style={{ 
                            backgroundColor: getColorWithOpacity(currentColor, 0.1),
                            borderColor: getColorWithOpacity(currentColor, 0.3)
                          }}
                        >
                          <span className="text-xs font-medium" style={{ color: currentColor }}>
                            {teacher.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(teacher.id)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{ 
                              backgroundColor: getColorWithOpacity(currentColor, 0.1),
                              color: currentColor 
                            }}
                            title="Edit guru"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteGuru(teacher.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 hover:scale-110"
                            title="Hapus guru"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <MdNaturePeople 
                          className="text-6xl mb-4 opacity-50"
                          style={{ color: currentColor }}
                        />
                        <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Tidak ada green educators ditemukan
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Coba ubah filter pencarian Anda
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Summary Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Menampilkan {filteredGuru.length} dari {guru.length} green educators
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ListGuru;