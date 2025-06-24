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
  FaChartLine
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

  // Context
  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Data untuk cards dashboard
  const dashboardData = [
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

  // Effects
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchDashboardData();
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
        axios.get(`${apiUrl}/soal`, { headers }),
        axios.get(`${apiUrl}/users`, { headers }),
      ]);

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
                  Green Science Learning Management System - SMA 1 Lhokseumawe
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
          {dashboardData.map((item, index) => (
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
                      {item.count}
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

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
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
                  Progress Green Science Learning
                </h2>
                <p className={`${currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Monitoring pembelajaran berkelanjutan dan ramah lingkungan
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Literasi Sains */}
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.05),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <MdScience className="text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Literasi Sains
                    </h3>
                    <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pemahaman konsep IPA
                    </p>
                  </div>
                </div>
                <div 
                  className="h-2 bg-gray-200 rounded-full mb-2"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
                >
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ backgroundColor: currentColor, width: '75%' }}
                  ></div>
                </div>
                <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  75% tercapai
                </p>
              </div>

              {/* Green Economy */}
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.05),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <FaRecycle className="text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Green Economy
                    </h3>
                    <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ekonomi berkelanjutan
                    </p>
                  </div>
                </div>
                <div 
                  className="h-2 bg-gray-200 rounded-full mb-2"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
                >
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ backgroundColor: currentColor, width: '68%' }}
                  ></div>
                </div>
                <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  68% implementasi
                </p>
              </div>

              {/* Limbah Organik */}
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  backgroundColor: getColorWithOpacity(currentColor, 0.05),
                  borderColor: getColorWithOpacity(currentColor, 0.2)
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-full"
                    style={{ backgroundColor: currentColor }}
                  >
                    <MdNaturePeople className="text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${currentMode === 'Dark' ? 'text-white' : 'text-gray-800'}`}>
                      Limbah Organik
                    </h3>
                    <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pengolahan berkelanjutan
                    </p>
                  </div>
                </div>
                <div 
                  className="h-2 bg-gray-200 rounded-full mb-2"
                  style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
                >
                  <div 
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{ backgroundColor: currentColor, width: '82%' }}
                  ></div>
                </div>
                <p className={`text-sm ${currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  82% partisipasi
                </p>
              </div>
            </div>
          </div>
        </motion.div>
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