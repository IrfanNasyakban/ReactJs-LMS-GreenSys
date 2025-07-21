import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe, LogOut, reset } from "../features/authSlice";
import { motion } from "framer-motion";
import { useStateContext } from "../contexts/ContextProvider";

import {
  FaLeaf,
  FaRecycle,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaPencilAlt,
  FaEye,
  FaSignOutAlt,
  FaInfoCircle,
  FaChartLine,
  FaClock,
  FaTrophy,
  FaPlay,
  FaCheckCircle
} from "react-icons/fa";
import { MdScience, MdEco, MdNaturePeople } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const Dashboard = () => {
  // State management
  const [jumlahModul, setJumlahModul] = useState(0);
  const [jumlahSoal, setJumlahSoal] = useState(0);
  const [jumlahSiswa, setJumlahSiswa] = useState(0);
  const [jumlahGuru, setJumlahGuru] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("");
  
  // Student progress state
  const [studentStatistics, setStudentStatistics] = useState({
    totalSubModules: 0,
    completedSubModules: 0,
    overallProgress: 0,
    totalWatchTime: 0,
    averageCompletion: 0,
    moduleStatistics: []
  });
  const [recentProgress, setRecentProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  // Context
  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Data untuk cards dashboard (berbeda untuk siswa dan admin/guru)
  const getDashboardData = () => {
    if (user?.role === "siswa") {
      return [
        {
          icon: <FaBook />,
          count: studentStatistics.totalSubModules,
          title: "Total Sub Modul",
          subtitle: "Materi pembelajaran tersedia",
          color: currentColor,
        },
        {
          icon: <FaCheckCircle />,
          count: studentStatistics.completedSubModules,
          title: "Sub Modul Selesai",
          subtitle: "Pembelajaran yang telah diselesaikan",
          color: currentColor,
        },
        {
          icon: <FaTrophy />,
          count: `${Math.round(studentStatistics.overallProgress)}%`,
          title: "Progress Keseluruhan",
          subtitle: "Tingkat penyelesaian pembelajaran",
          color: currentColor,
        },
        {
          icon: <FaClock />,
          count: `${Math.round(studentStatistics.totalWatchTime / 60)}m`,
          title: "Waktu Belajar",
          subtitle: "Total waktu yang dihabiskan",
          color: currentColor,
        },
      ];
    } else {
      return [
        {
          icon: <FaBook />,
          count: jumlahModul,
          title: "Modul Green Science",
          subtitle: "Pembelajaran IPA berkelanjutan",
          color: currentColor,
        },
        {
          icon: <FaPencilAlt />,
          count: jumlahSoal,
          title: "Bank Soal Eco-Learning",
          subtitle: "Evaluasi berbasis lingkungan",
          color: currentColor,
        },
        {
          icon: <FaUsers />,
          count: jumlahSiswa,
          title: "Green Learners",
          subtitle: "Siswa masa depan berkelanjutan",
          color: currentColor,
        },
        {
          icon: <FaChalkboardTeacher />,
          count: jumlahGuru,
          title: "Green Educators",
          subtitle: "Guru ramah lingkungan",
          color: currentColor,
        },
      ];
    }
  };

  // Effects
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      if (user?.role === "siswa") {
        fetchStudentProgressData();
      } else {
        fetchDashboardData();
      }
      checkUserProfile();
    } else {
      navigate("/");
    }
  }, [navigate, user]);

  // API Functions
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data
      const [modulRes, soalRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/modul`, { headers }),
        axios.get(`${apiUrl}/group-soal`, { headers }),
        axios.get(`${apiUrl}/users`, { headers }),
      ]);

      console.log("data modul:" + modulRes.data);
      console.log("data soal:" + soalRes.data);
      console.log("data siswa:" + usersRes.data);
      

      setJumlahModul(modulRes.data.length);
      setJumlahSoal(soalRes.data.length);
      
      const siswaUsers = usersRes.data.filter((user) => user.role === "siswa");
      const guruUsers = usersRes.data.filter((user) => user.role === "guru");
      setJumlahSiswa(siswaUsers.length);
      setJumlahGuru(guruUsers.length);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Student Progress API Functions
  const fetchStudentProgressData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch student statistics
      const statisticsRes = await axios.get(`${apiUrl}/student-progress/statistics`, { headers });
      setStudentStatistics(statisticsRes.data);

      // Fetch recent progress (you might want to create a new endpoint for this)
      // For now, we'll use module statistics as recent progress
      setRecentProgress(statisticsRes.data.moduleStatistics || []);

    } catch (error) {
      console.error("Error fetching student progress:", error);
      setStudentStatistics({
        totalSubModules: 0,
        completedSubModules: 0,
        overallProgress: 0,
        totalWatchTime: 0,
        averageCompletion: 0,
        moduleStatistics: []
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async () => {
    if (!user || user.role === "admin") return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const endpoint = user.role === "guru" ? "/profile-guru" : "/profile-siswa";
      
      await axios.get(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      if (error.response?.status === 404) {
        const message = user.role === "guru" 
          ? "Profil guru Anda belum dibuat. Silakan buat profil untuk melanjutkan mengajar green science."
          : "Profil siswa Anda belum dibuat. Silakan buat profil untuk melanjutkan pembelajaran green science.";
        const path = user.role === "guru" ? "/add-profile-guru" : "/add-profile-siswa";
        
        setModalMessage(message);
        setRedirectPath(path);
        setShowModal(true);
      }
    }
  };

  // Event handlers
  const handleModalConfirm = () => {
    setShowModal(false);
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  const handleLogout = async () => {
    await dispatch(LogOut());
    dispatch(reset());
    navigate("/");
  };

  // Helper function for colors
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
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
          <MdEco 
            className="absolute bottom-20 right-10 text-8xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1.5s' }} 
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
                <MdScience className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                  Dashboard <span style={{ color: currentColor }}>GreenSys</span>
                </h1>
                <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user?.role === "siswa" 
                    ? "Selamat datang di pembelajaran Green Science" 
                    : "Green Science Learning Management System"
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {getDashboardData().map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="group cursor-pointer"
            >
              <div 
                className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.08),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-3 rounded-full group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: currentColor }}
                  >
                    <span className="text-white text-xl">{item.icon}</span>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: currentColor }}
                    >
                      {loading && user?.role === "siswa" ? "..." : item.count}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className={`font-semibold text-lg mb-1 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Section - Different for Students and Admin/Guru */}
        {user?.role === "siswa" ? (
          // Student Progress Section
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Module Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div 
                className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.08),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <FaChartLine className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Progress Modul
                    </h2>
                    <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Kemajuan pembelajaran per modul
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: currentColor }}></div>
                    </div>
                  ) : recentProgress.length > 0 ? (
                    recentProgress.map((module, index) => {
                      const moduleProgress = module.totalSubModules > 0 
                        ? (module.completedSubModules / module.totalSubModules) * 100 
                        : 0;

                      return (
                        <div 
                          key={index}
                          className="p-4 rounded-xl border"
                          style={{ 
                            backgroundColor: getColorWithOpacity(currentColor, 0.05),
                            borderColor: getColorWithOpacity(currentColor, 0.2)
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className={`font-semibold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                                {module.modulTitle}
                              </h3>
                              <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {module.completedSubModules}/{module.totalSubModules} sub modul selesai
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold" style={{ color: currentColor }}>
                                {Math.round(moduleProgress)}%
                              </span>
                              <p className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatTime(module.totalWatchTime)}
                              </p>
                            </div>
                          </div>
                          <div 
                            className="h-2 bg-gray-200 rounded-full"
                            style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
                          >
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                backgroundColor: currentColor, 
                                width: `${moduleProgress}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={`text-center py-8 ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FaBook className="text-4xl mb-3 mx-auto opacity-50" />
                      <p>Belum ada progress pembelajaran</p>
                      <p className="text-sm">Mulai belajar untuk melihat progress Anda</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Learning Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div 
                className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.08),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <FaTrophy className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Ringkasan Pembelajaran
                    </h2>
                    <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Statistik pembelajaran Anda
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Overall Progress Circle */}
                  <div className="text-center mb-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={getColorWithOpacity(currentColor, 0.2)}
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={currentColor}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - studentStatistics.overallProgress / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold" style={{ color: currentColor }}>
                            {Math.round(studentStatistics.overallProgress)}%
                          </div>
                          <div className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Selesai
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                    >
                      <div className="text-lg font-bold" style={{ color: currentColor }}>
                        {studentStatistics.completedSubModules}
                      </div>
                      <div className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Modul Selesai
                      </div>
                    </div>
                    <div 
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                    >
                      <div className="text-lg font-bold" style={{ color: currentColor }}>
                        {formatTime(studentStatistics.totalWatchTime)}
                      </div>
                      <div className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Waktu Belajar
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <button
                    onClick={() => navigate('/modul-belajar')}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
                    style={{ backgroundColor: currentColor }}
                  >
                    <FaPlay />
                    Lanjutkan Belajar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Admin/Guru Progress Section (Original)
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Tentang GreenSys */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div 
                className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.08),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <FaInfoCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Tentang GreenSys
                    </h2>
                    <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Platform pembelajaran Green Science terdepan
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-xl border"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: currentColor }}
                      >
                        <MdScience className="text-white text-sm" />
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                          Pembelajaran Berkelanjutan
                        </h3>
                        <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Mengintegrasikan konsep green science dalam pendidikan IPA untuk menciptakan generasi yang peduli lingkungan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl border"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: currentColor }}
                      >
                        <FaUsers className="text-white text-sm" />
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                          Komunitas Edukatif
                        </h3>
                        <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Menghubungkan guru dan siswa dalam ekosistem pembelajaran yang mendukung praktik ramah lingkungan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-xl border"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: currentColor }}
                      >
                        <FaChartLine className="text-white text-sm" />
                      </div>
                      <div>
                        <h3 className={`font-semibold mb-1 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                          Monitoring & Evaluasi
                        </h3>
                        <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Sistem pelacakan kemajuan yang komprehensif untuk memantau pencapaian pembelajaran green science.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fitur Unggulan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div 
                className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.08),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <FaLeaf className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Fitur Unggulan
                    </h2>
                    <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Teknologi terdepan untuk pendidikan berkelanjutan
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Interactive Learning */}
                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div 
                      className="p-3 rounded-full mx-auto mb-3 w-fit"
                      style={{ backgroundColor: currentColor }}
                    >
                      <FaBook className="text-white text-lg" />
                    </div>
                    <h3 className={`font-semibold text-sm mb-2 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Modul Interaktif
                    </h3>
                    <p className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pembelajaran multimedia dengan simulasi virtual
                    </p>
                  </div>

                  {/* Green Assessment */}
                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div 
                      className="p-3 rounded-full mx-auto mb-3 w-fit"
                      style={{ backgroundColor: currentColor }}
                    >
                      <FaPencilAlt className="text-white text-lg" />
                    </div>
                    <h3 className={`font-semibold text-sm mb-2 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Green Assessment
                    </h3>
                    <p className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Evaluasi berbasis proyek lingkungan
                    </p>
                  </div>

                  {/* Progress Tracking */}
                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div 
                      className="p-3 rounded-full mx-auto mb-3 w-fit"
                      style={{ backgroundColor: currentColor }}
                    >
                      <FaChartLine className="text-white text-lg" />
                    </div>
                    <h3 className={`font-semibold text-sm mb-2 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Progress Tracking
                    </h3>
                    <p className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pelacakan kemajuan real-time
                    </p>
                  </div>

                  {/* Eco Community */}
                  <div 
                    className="p-4 rounded-xl border text-center"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.1),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div 
                      className="p-3 rounded-full mx-auto mb-3 w-fit"
                      style={{ backgroundColor: currentColor }}
                    >
                      <MdEco className="text-white text-lg" />
                    </div>
                    <h3 className={`font-semibold text-sm mb-2 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Eco Community
                    </h3>
                    <p className={`text-xs ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Kolaborasi dalam proyek hijau
                    </p>
                  </div>
                </div>

                {/* Vision Statement */}
                <div 
                  className="mt-6 p-4 rounded-xl border"
                  style={{ 
                    backgroundColor: getColorWithOpacity(currentColor, 0.05),
                    borderColor: getColorWithOpacity(currentColor, 0.3)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <GiPlantSeed style={{ color: currentColor }} className="text-2xl flex-shrink-0" />
                    <div>
                      <h4 className={`font-semibold mb-1 ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                        Visi GreenSys
                      </h4>
                      <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        "Menciptakan generasi cerdas yang peduli lingkungan melalui pendidikan sains berkelanjutan"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={handleLogout}
          ></div>
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden z-10"
            style={{ 
              backgroundColor: currentMode === 'Dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
            }}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4"
              style={{ 
                background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
              }}
            >
              <div className="flex items-center gap-3">
                <FaInfoCircle className="h-6 w-6 text-white" />
                <h3 className="text-lg font-bold text-white">
                  Pemberitahuan GreenSys
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div 
                  className={`p-3 rounded-full flex-shrink-0 ${
                    currentMode === 'Dark' ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}
                >
                  <FaInfoCircle 
                    className={`h-8 w-8 ${currentMode === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}
                  />
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed mb-4 ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {modalMessage}
                  </p>
                  
                  <div className="p-3 rounded-lg" style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}>
                    <div className="flex items-center gap-2">
                      <FaLeaf style={{ color: currentColor }} className="text-sm" />
                      <span className={`text-xs font-medium ${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Lengkapi profil untuk mengakses fitur Green Science
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              className="px-6 py-4 border-t flex gap-3 justify-end"
              style={{ 
                backgroundColor: getColorWithOpacity(currentColor, 0.05),
                borderColor: getColorWithOpacity(currentColor, 0.2)
              }}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
                style={{ backgroundColor: currentColor }}
                onClick={handleModalConfirm}
              >
                <FaEye />
                Lengkapi Profil Green Science
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                Keluar
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;