import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { motion } from "framer-motion";
import { useStateContext } from "../contexts/ContextProvider";

import { Header } from "../components";

import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUsers, 
  FaGraduationCap,
  FaLeaf,
  FaUserGraduate,
  FaChartBar,
  FaSearch,
  FaFilter,
  FaDownload
} from "react-icons/fa";
import { MdScience, MdEco, MdNaturePeople } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const ListSiswa = () => {
  const [siswa, setSiswa] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getSiswa();
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    filterSiswaData();
  }, [siswa, searchTerm, filterClass, filterGender]);

  const getSiswa = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/siswa`);
      setSiswa(response.data);
      calculateClassStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const filterSiswaData = () => {
    let filtered = siswa;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterClass) {
      filtered = filtered.filter(s => s.kelas?.kelas === filterClass);
    }

    if (filterGender) {
      filtered = filtered.filter(s => s.gender === filterGender);
    }

    setFilteredSiswa(filtered);
  };

  const calculateClassStats = (siswaData) => {
    const classSummary = {};
    
    siswaData.forEach((student) => {
      const kelasId = student.kelasId;
      const namaKelas = student.kelas ? student.kelas.kelas : 'Unknown';
      
      if (!classSummary[kelasId]) {
        classSummary[kelasId] = {
          kelasId: kelasId,
          namaKelas: namaKelas,
          totalSiswa: 0,
          maleCount: 0,
          femaleCount: 0,
          avgAge: 0,
          ageSum: 0
        };
      }
      
      classSummary[kelasId].totalSiswa++;
      if (student.gender === 'Laki-laki') classSummary[kelasId].maleCount++;
      if (student.gender === 'Perempuan') classSummary[kelasId].femaleCount++;
      if (student.umur) classSummary[kelasId].ageSum += parseInt(student.umur);
    });

    const statsArray = Object.values(classSummary).map(kelas => ({
      ...kelas,
      avgAge: kelas.ageSum > 0 ? Math.round(kelas.ageSum / kelas.totalSiswa) : 0,
      malePercentage: Math.round((kelas.maleCount / kelas.totalSiswa) * 100),
      femalePercentage: Math.round((kelas.femaleCount / kelas.totalSiswa) * 100)
    }));

    setClassStats(statsArray.sort((a, b) => a.namaKelas.localeCompare(b.namaKelas)));
  };

  const handleEdit = (id) => {
    navigate(`/siswa/${id}`);
  };

  const handleDeleteSiswa = async (userId) => {
    const token = localStorage.getItem("accessToken");
    const apiUrl = process.env.REACT_APP_URL_API;
    await axios.delete(`${apiUrl}/siswa/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    getSiswa();
  };

  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const uniqueClasses = [...new Set(siswa.map(s => s.kelas?.kelas).filter(Boolean))];

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
                <FaUserGraduate className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                  Green <span style={{ color: currentColor }}>Learners</span>
                </h1>
                <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Data siswa pembelajar Green Science - SMA 1 Lhokseumawe
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
                  placeholder="Cari nama, NIS, atau username..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                    currentMode === 'Dark' 
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

              {/* Class Filter */}
              <select
                className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  currentMode === 'Dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {uniqueClasses.map(kelas => (
                  <option key={kelas} value={kelas}>{kelas}</option>
                ))}
              </select>

              {/* Gender Filter */}
              <select
                className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  currentMode === 'Dark' 
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

              {/* Export Button */}
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: currentColor }}
              >
                <FaDownload />
                Export Data
              </button>
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
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    NIS
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Nama Green Learner
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Username
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Email
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Eco Class
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Gender
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Umur
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
                    Foto
                  </th>
                  <th className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${currentMode === 'Dark' ? 'text-white' : 'text-gray-700'}`}>
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
                        <span className={`ml-2 ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Loading green learners...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSiswa.length > 0 ? (
                  filteredSiswa.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-colors duration-200 ${
                        currentMode === 'Dark' 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 text-sm font-medium ${currentMode === 'Dark' ? 'text-white' : 'text-gray-900'}`}>
                        {student.nis}
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <FaLeaf className="text-xs" style={{ color: currentColor }} />
                          {student.nama}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {student.user?.username || "-"}
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {student.email}
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: currentColor }}
                        >
                          {student.kelas?.kelas || "-"}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {student.gender}
                      </td>
                      <td className={`px-6 py-4 text-sm ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {student.umur} tahun
                      </td>
                      <td className="px-6 py-4">
                        {student.url ? (
                          <img
                            src={student.url}
                            alt={`Foto ${student.nama}`}
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
                              {student.nama.charAt(0)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(student.id)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{ 
                              backgroundColor: getColorWithOpacity(currentColor, 0.1),
                              color: currentColor 
                            }}
                            title="Edit siswa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteSiswa(student.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 hover:scale-110"
                            title="Hapus siswa"
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
                        <p className={`text-lg font-medium ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Tidak ada green learners ditemukan
                        </p>
                        <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
          <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Menampilkan {filteredSiswa.length} dari {siswa.length} green learners
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ListSiswa;