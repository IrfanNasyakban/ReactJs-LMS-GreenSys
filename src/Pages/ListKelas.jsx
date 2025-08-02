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
  FaDoorOpen,
  FaPlus,
  FaUsers,
  FaLeaf,
  FaSearch,
  FaDownload,
} from "react-icons/fa";
import { MdScience, MdClass } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const ListKelas = () => {
  const [kelas, setKelas] = useState([]);
  const [filteredKelas, setFilteredKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [kelasStats, setKelasStats] = useState([]);

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getKelas();
      getKelasWithStudents();
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    filterKelasData();
  }, [kelas, searchTerm]);

  const getKelas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/kelas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKelas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getKelasWithStudents = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const [kelasResponse, siswaResponse] = await Promise.all([
        axios.get(`${apiUrl}/kelas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/siswa`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const kelasData = kelasResponse.data;
      const siswaData = siswaResponse.data;

      // Calculate statistics
      const stats = kelasData.map((k) => {
        const siswaInClass = siswaData.filter((s) => s.kelasId === k.id);
        return {
          ...k,
          totalSiswa: siswaInClass.length,
          maleCount: siswaInClass.filter((s) => s.gender === "Laki-laki")
            .length,
          femaleCount: siswaInClass.filter((s) => s.gender === "Perempuan")
            .length,
        };
      });

      setKelasStats(stats);
    } catch (error) {
      console.error("Error fetching class statistics:", error);
    }
  };

  const filterKelasData = () => {
    let filtered = kelas;

    if (searchTerm) {
      filtered = filtered.filter(
        (k) =>
          k.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.namaKelas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredKelas(filtered);
  };

  const handleTambah = () => {
    navigate("/kelas/tambah-kelas");
  };

  const handleEdit = (id) => {
    navigate(`/kelas/${id}`);
  };

  const handleDeleteKelas = async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.delete(`${apiUrl}/kelas/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      getKelas();
      getKelasWithStudents();
    } catch (error) {
      console.error("Error deleting kelas:", error);
    }
  };

  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === "Dark";

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
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: currentColor }}
                >
                  <MdClass className="text-white text-2xl" />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Eco <span style={{ color: currentColor }}>Classrooms</span>
                  </h1>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Manajemen kelas Green Science - SMA 1 Lhokseumawe
                  </p>
                </div>
              </div>
              <button
                onClick={handleTambah}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg font-medium"
                style={{ backgroundColor: currentColor }}
              >
                <FaPlus />
                Tambah Eco Class
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search Section */}
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
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama kelas atau kode kelas..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  style={{
                    focusRingColor: getColorWithOpacity(currentColor, 0.5),
                    borderColor: getColorWithOpacity(currentColor, 0.3),
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

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
            borderColor: getColorWithOpacity(currentColor, 0.2),
          }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    No
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Kode Eco Class
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Nama Eco Class
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Total Green Learners
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Gender Distribution
                  </th>
                  <th
                    className={`px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider ${
                      isDark ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
                          style={{
                            borderColor: getColorWithOpacity(currentColor, 0.3),
                          }}
                        ></div>
                        <span
                          className={`ml-2 ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Loading eco classrooms...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredKelas.length > 0 ? (
                  filteredKelas.map((classroom, index) => {
                    const stats = kelasStats.find(
                      (k) => k.id === classroom.id
                    ) || { totalSiswa: 0, maleCount: 0, femaleCount: 0 };
                    return (
                      <motion.tr
                        key={classroom.id}
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
                          {index + 1}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaDoorOpen
                              className="text-xs"
                              style={{ color: currentColor }}
                            />
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: currentColor }}
                            >
                              {classroom.kelas}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaLeaf
                              className="text-xs"
                              style={{ color: currentColor }}
                            />
                            {classroom.namaKelas}
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FaUsers
                              className="text-xs"
                              style={{ color: currentColor }}
                            />
                            <span className="font-medium">
                              {stats.totalSiswa} siswa
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          <div className="flex gap-2">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: getColorWithOpacity(
                                  currentColor,
                                  0.1
                                ),
                                color: currentColor,
                              }}
                            >
                              ♂ {stats.maleCount}
                            </span>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: getColorWithOpacity(
                                  currentColor,
                                  0.1
                                ),
                                color: currentColor,
                              }}
                            >
                              ♀ {stats.femaleCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(classroom.id)}
                              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                              style={{
                                backgroundColor: getColorWithOpacity(
                                  currentColor,
                                  0.1
                                ),
                                color: currentColor,
                              }}
                              title="Edit kelas"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteKelas(classroom.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 hover:scale-110"
                              title="Hapus kelas"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <MdClass
                          className="text-6xl mb-4 opacity-50"
                          style={{ color: currentColor }}
                        />
                        <p
                          className={`text-lg font-medium ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Tidak ada eco classrooms ditemukan
                        </p>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Tambahkan eco class baru atau ubah filter pencarian
                        </p>
                        <button
                          onClick={handleTambah}
                          className="mt-4 flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:scale-105"
                          style={{ backgroundColor: currentColor }}
                        >
                          <FaPlus />
                          Tambah Eco Class
                        </button>
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
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Menampilkan {filteredKelas.length} dari {kelas.length} eco
            classrooms
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ListKelas;
