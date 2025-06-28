import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaChevronRight,
  FaPlay,
  FaYoutube,
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaBook,
  FaGraduationCap,
  FaLightbulb,
  FaSeedling,
  FaLeaf,
  FaEye,
  FaShare,
  FaBookmark,
  FaExpand,
  FaVolumeUp,
  FaChevronLeft,
  FaListAlt,
  FaCheckCircle,
  FaLock,
  FaCheck,
  FaPlayCircle,
  FaCertificate,
} from "react-icons/fa";
import { MdOndemandVideo, MdDescription, MdLibraryBooks } from "react-icons/md";
import { BsCollection, BsFileEarmarkText } from "react-icons/bs";

const ViewContent = () => {
  const [modulId, setModulId] = useState("");
  const [subModuleData, setSubModuleData] = useState(null);
  const [subModuleDataByModulId, setSubModuleDataByModulId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // ✅ NEW: Progress tracking states
  const [progressData, setProgressData] = useState(null);
  const [currentProgress, setCurrentProgress] = useState({
    isCompleted: false,
    completionPercentage: 0,
    watchTime: 0,
  });
  const [canAccess, setCanAccess] = useState(true);
  const [accessMessage, setAccessMessage] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentColor, currentMode } = useStateContext();

  const isDark = currentMode === "Dark";
  const isSiswa = user?.role === "siswa"; // ✅ Check if user is student

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Get current sub module index
  const getCurrentSubModuleIndex = () => {
    if (!subModuleDataByModulId || !subModuleData) return -1;
    return subModuleDataByModulId.findIndex((item) => item.id === parseInt(id));
  };

  // ✅ NEW: Check if submodule is completed
  const isSubModuleCompleted = (subModuleId) => {
    if (!progressData || !progressData.subModulesProgress) return false;
    const progress = progressData.subModulesProgress.find(
      (item) => item.subModul.id === subModuleId
    );
    return progress?.progress?.isCompleted || false;
  };

  // ✅ NEW: Check if submodule can be accessed
  const canAccessSubModule = (index) => {
    if (!isSiswa) return true; // Non-students can access all
    if (index === 0) return true; // First submodule always accessible

    // Check if previous submodule is completed
    const previousSubModule = subModuleDataByModulId[index - 1];
    return isSubModuleCompleted(previousSubModule.id);
  };

  // Navigation functions with access control
  const navigateToNextSubModule = () => {
    const currentIndex = getCurrentSubModuleIndex();
    if (
      currentIndex !== -1 &&
      currentIndex < subModuleDataByModulId.length - 1
    ) {
      const nextIndex = currentIndex + 1;
      if (canAccessSubModule(nextIndex)) {
        const nextSubModule = subModuleDataByModulId[nextIndex];
        // Tambahkan logika untuk refresh sebelum navigasi
        const currentPath = `/sub-modul-belajar/view/${nextSubModule.id}`;
        // Menggunakan window.location.reload() untuk refresh.
        window.location.href = currentPath;
      } else {
        alert("Selesaikan sub modul sebelumnya terlebih dahulu!");
      }
    }
  };

  const navigateToPreviousSubModule = () => {
    const currentIndex = getCurrentSubModuleIndex();
    if (currentIndex > 0) {
      const previousSubModule = subModuleDataByModulId[currentIndex - 1];
      navigate(`/sub-modul-belajar/view/${previousSubModule.id}`);
    }
  };

  const navigateToSubModule = (subModuleId, index) => {
    if (canAccessSubModule(index)) {
      navigate(`/sub-modul-belajar/view/${subModuleId}`);
    } else {
      alert("Selesaikan sub modul sebelumnya terlebih dahulu!");
    }
  };

  // Check if navigation is available with access control
  const hasNextSubModule = () => {
    const currentIndex = getCurrentSubModuleIndex();
    if (
      currentIndex === -1 ||
      currentIndex >= subModuleDataByModulId?.length - 1
    ) {
      return false;
    }
    return canAccessSubModule(currentIndex + 1);
  };

  const hasPreviousSubModule = () => {
    const currentIndex = getCurrentSubModuleIndex();
    return currentIndex > 0;
  };

  // function to check if this is the last submodule
  const isLastSubModule = () => {
    const currentIndex = getCurrentSubModuleIndex();
    return currentIndex === subModuleDataByModulId?.length - 1;
  };

  // function to navigate to the certificate page
  const navigateToCertificate = () => {
    if (modulId) {
      navigate(`/cetak-sertifikat/${modulId}`);
    }
  };

  // function to check has can access the certificate
  const canAccessCertificate = () => {
    if (!isSiswa) return true; // Non-students can access certificate
    if (!progressData) return false;

    // Check if all submodules are completed
    return progressData.completedSubModules === progressData.totalSubModules;
  };

  // ✅ NEW: Progress API functions
  const startProgress = async () => {
    if (!isSiswa) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      await axios.post(
        `${apiUrl}/student-progress/start`,
        { subModulId: parseInt(id) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error starting progress:", error);
    }
  };

  const updateProgressAPI = async (watchTime, completionPercentage) => {
    if (!isSiswa) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      await axios.patch(
        `${apiUrl}/student-progress/update`,
        {
          subModulId: parseInt(id),
          watchTime: watchTime,
          completionPercentage: completionPercentage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setCurrentProgress((prev) => ({
        ...prev,
        watchTime: watchTime,
        completionPercentage: completionPercentage,
      }));
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const markAsCompleted = async () => {
    if (!isSiswa) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      await axios.patch(
        `${apiUrl}/student-progress/complete`,
        { subModulId: parseInt(id) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setCurrentProgress((prev) => ({
        ...prev,
        isCompleted: true,
        completionPercentage: 100,
      }));

      // Refresh progress data
      getProgressData();
      setShowCompleteModal(false);
    } catch (error) {
      console.error("Error marking as completed:", error);
      alert("Gagal menandai sebagai selesai");
    }
  };

  const getProgressData = async () => {
    if (!isSiswa || !modulId) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      const response = await axios.get(
        `${apiUrl}/student-progress/module/${modulId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProgressData(response.data);
    } catch (error) {
      console.error("Error getting progress data:", error);
    }
  };

  const getCurrentProgressData = async () => {
    if (!isSiswa) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      const response = await axios.get(
        `${apiUrl}/student-progress/submodule/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.progress) {
        setCurrentProgress(response.data.progress);
      }
    } catch (error) {
      console.error("Error getting current progress:", error);
    }
  };

  const checkAccessAPI = async () => {
    if (!isSiswa) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      const response = await axios.get(
        `${apiUrl}/student-progress/check-access/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCanAccess(response.data.canAccess);
      setAccessMessage(response.data.message);

      if (!response.data.canAccess) {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error checking access:", error);
    }
  };

  // ✅ NEW: Simulate video progress (you can integrate with actual video player)
  const simulateVideoProgress = () => {
    if (!isSiswa || currentProgress.isCompleted) return;

    let watchTimeCounter = currentProgress.watchTime || 0;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        const newWatchTime = prev.watchTime + 5; // 5 seconds increment
        watchTimeCounter = newWatchTime;
        const newPercentage = Math.min((newWatchTime / 60) * 100, 100);

        // Update API every 30 seconds
        if (newWatchTime % 30 === 0) {
          updateProgressAPI(newWatchTime, newPercentage);
        }

        // Auto complete setelah 60 detik
        if (newWatchTime >= 60 && !prev.isCompleted) {
          setTimeout(() => {
            markAsCompleted();
          }, 1000);

          return {
            ...prev,
            watchTime: newWatchTime,
            completionPercentage: 100,
            isCompleted: true,
          };
        }

        return {
          ...prev,
          watchTime: newWatchTime,
          completionPercentage: newPercentage,
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getSubModulById();
    } else {
      navigate("/login");
    }
  }, [navigate, id]);

  useEffect(() => {
    if (modulId) {
      getSubModulByModulId();
      if (isSiswa) {
        getProgressData();
        getCurrentProgressData();
        checkAccessAPI();
      }
    }
  }, [modulId, isSiswa]);

  // ✅ NEW: Start progress and simulate video watching when component mounts
  useEffect(() => {
    if (subModuleData && isSiswa && canAccess) {
      startProgress();

      // Start simulating video progress after 3 seconds
      const timeout = setTimeout(() => {
        const cleanup = simulateVideoProgress();
        return cleanup;
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [subModuleData, isSiswa, canAccess]);

  const getSubModulById = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/sub-modul/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubModuleData(response.data);

      if (response.data.modulId) {
        setModulId(response.data.modulId);
      } else {
        console.error("modulId tidak ada dalam data");
      }
    } catch (error) {
      console.error("Error fetching module content:", error);
      if (error.response?.status === 404) {
        setError("Konten tidak ditemukan");
      } else {
        setError("Gagal memuat konten pembelajaran");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSubModulByModulId = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      const response = await axios.get(
        `${apiUrl}/sub-modul-by-modulid/${modulId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubModuleDataByModulId(response.data);
    } catch (error) {
      console.error("Error fetching module content:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
            }}
          />
          <p className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
            Memuat konten pembelajaran...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || (isSiswa && !canAccess)) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl max-w-md">
            <FaLock className="text-red-500 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {isSiswa && !canAccess ? "Akses Terbatas!" : "Oops!"}
            </h3>
            <p className="text-red-700 mb-4">
              {isSiswa && !canAccess ? accessMessage : error}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Kembali
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!subModuleData) return null;

  const videoId = getYouTubeVideoId(subModuleData.urlYoutube);
  const currentIndex = getCurrentSubModuleIndex();

  return (
    <div className="min-h-screen p-6">
      {/* ✅ NEW: Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-xl max-w-md w-full mx-4 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="text-center">
              <FaCheck className="text-green-500 text-4xl mx-auto mb-4" />
              <h3
                className={`text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Selamat! 🎉
              </h3>
              <p
                className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Anda telah menonton{" "}
                {Math.round(currentProgress.completionPercentage)}% dari video
                ini. Tandai sebagai selesai?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={markAsCompleted}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Tandai Selesai
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <FaGraduationCap
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <FaLightbulb
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "1s" }}
          />
          <MdLibraryBooks
            className="absolute bottom-40 left-20 text-7xl animate-pulse"
            style={{ color: currentColor, animationDelay: "0.5s" }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/modul-belajar")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <FaArrowLeft />
              Modul Belajar
            </button>
            <FaChevronRight
              className={isDark ? "text-gray-500" : "text-gray-400"}
            />
            <button
              onClick={() =>
                navigate(`/modul-belajar/detail/${subModuleData.modulId}`)
              }
              className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {subModuleData.modul?.judul}
            </button>
            <FaChevronRight
              className={isDark ? "text-gray-500" : "text-gray-400"}
            />
            <span style={{ color: currentColor }} className="font-medium">
              {subModuleData.subJudul}
            </span>
          </div>
        </motion.div>

        {/* Header Section with Progress */}
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
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <MdOndemandVideo className="text-white text-2xl" />
              </div>
              <div className="flex-1">
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  <span style={{ color: currentColor }}>Pembelajaran</span>{" "}
                  Interactive
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Green Science Learning - {subModuleData.modul?.judul}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {subModuleDataByModulId && (
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sub Modul {currentIndex + 1} dari{" "}
                      {subModuleDataByModulId.length}
                    </p>
                  )}
                  {/* ✅ NEW: Progress indicator for students */}
                  {isSiswa && (
                    <div className="flex items-center gap-2">
                      {currentProgress.isCompleted ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <FaCheckCircle />
                          <span className="text-sm">Selesai</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${currentProgress.completionPercentage}%`,
                                backgroundColor: currentColor,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round(currentProgress.completionPercentage)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* ✅ NEW: Complete button for students */}
                {isSiswa && !currentProgress.isCompleted && (
                  <motion.button
                    onClick={() => setShowCompleteModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    <FaCheck className="inline mr-1" />
                    Tandai Selesai
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <FaBookmark
                    className={isDark ? "text-gray-300" : "text-gray-600"}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg border transition-colors ${
                    isDark
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <FaShare
                    className={isDark ? "text-gray-300" : "text-gray-600"}
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              {/* Video Header */}
              <div
                className="py-4 px-6"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <FaYoutube className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">
                    {subModuleData.subJudul}
                  </h2>
                  <div className="ml-auto flex items-center gap-2 text-white text-sm">
                    {isSiswa && currentProgress.isCompleted && (
                      <FaCheckCircle className="text-green-300" />
                    )}
                    <FaPlay className="text-xs" />
                    <span>Video Pembelajaran</span>
                  </div>
                </div>
              </div>

              {/* Video Content */}
              <div className="p-6">
                {videoId ? (
                  <div className="relative">
                    <div
                      className="relative w-full rounded-xl overflow-hidden shadow-lg"
                      style={{ paddingBottom: "56.25%", height: 0 }}
                    >
                      {!isVideoLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div
                              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                              style={{
                                borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
                              }}
                            />
                            <p className="text-gray-600">Memuat video...</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`}
                        title={subModuleData.subJudul}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                        onLoad={() => setIsVideoLoaded(true)}
                      />
                    </div>

                    {/* Video Controls Info */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FaVolumeUp style={{ color: currentColor }} />
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            Audio
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaExpand style={{ color: currentColor }} />
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            Fullscreen
                          </span>
                        </div>
                        {/* ✅ NEW: Progress info for students */}
                        {isSiswa && (
                          <div className="flex items-center gap-1">
                            <FaClock style={{ color: currentColor }} />
                            <span
                              className={
                                isDark ? "text-gray-300" : "text-gray-600"
                              }
                            >
                              {Math.floor(currentProgress.watchTime / 60)}:
                              {(currentProgress.watchTime % 60)
                                .toString()
                                .padStart(2, "0")}
                            </span>
                          </div>
                        )}
                      </div>
                      <a
                        href={subModuleData.urlYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                      >
                        <FaYoutube />
                        Buka di YouTube
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaYoutube className="text-gray-400 text-6xl mx-auto mb-4" />
                    <p
                      className={`text-lg ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Video tidak tersedia
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Link YouTube tidak valid atau belum diatur
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Navigation Buttons with Access Control */}
            {subModuleDataByModulId && subModuleDataByModulId.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-between items-center"
              >
                <motion.button
                  onClick={navigateToPreviousSubModule}
                  disabled={!hasPreviousSubModule()}
                  whileHover={{ scale: hasPreviousSubModule() ? 1.02 : 1 }}
                  whileTap={{ scale: hasPreviousSubModule() ? 0.98 : 1 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    hasPreviousSubModule()
                      ? `text-white shadow-lg hover:shadow-xl`
                      : `opacity-50 cursor-not-allowed ${
                          isDark
                            ? "bg-gray-700 text-gray-500"
                            : "bg-gray-200 text-gray-400"
                        }`
                  }`}
                  style={{
                    background: hasPreviousSubModule()
                      ? `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                          currentColor,
                          0.8
                        )} 100%)`
                      : undefined,
                  }}
                >
                  <FaChevronLeft />
                  Sub Modul Sebelumnya
                </motion.button>

                <div className="text-center">
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {currentIndex + 1} / {subModuleDataByModulId.length}
                  </div>
                  {/* ✅ Overall progress for students */}
                  {isSiswa && progressData && (
                    <div className="text-xs text-gray-500 mt-1">
                      {progressData.completedSubModules} dari{" "}
                      {progressData.totalSubModules} selesai
                    </div>
                  )}
                </div>

                {/* ✅ NEW: Conditional button - Next SubModule or Certificate */}
                {isLastSubModule() ? (
                  // Certificate Button for last submodule
                  <motion.button
                    onClick={navigateToCertificate}
                    disabled={isSiswa && !canAccessCertificate()}
                    whileHover={{
                      scale: isSiswa && !canAccessCertificate() ? 1 : 1.02,
                    }}
                    whileTap={{
                      scale: isSiswa && !canAccessCertificate() ? 1 : 0.98,
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isSiswa && !canAccessCertificate()
                        ? `opacity-50 cursor-not-allowed ${
                            isDark
                              ? "bg-gray-700 text-gray-500"
                              : "bg-gray-200 text-gray-400"
                          }`
                        : `text-white shadow-lg hover:shadow-xl`
                    }`}
                    style={{
                      background:
                        isSiswa && !canAccessCertificate()
                          ? undefined
                          : `linear-gradient(135deg, #10B981 0%, #059669 100%)`, // Green gradient for certificate
                    }}
                  >
                    <FaCertificate />
                    Cetak Sertifikat
                  </motion.button>
                ) : (
                  // Next SubModule Button
                  <motion.button
                    onClick={navigateToNextSubModule}
                    disabled={!hasNextSubModule()}
                    whileHover={{ scale: hasNextSubModule() ? 1.02 : 1 }}
                    whileTap={{ scale: hasNextSubModule() ? 0.98 : 1 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      hasNextSubModule()
                        ? `text-white shadow-lg hover:shadow-xl`
                        : `opacity-50 cursor-not-allowed ${
                            isDark
                              ? "bg-gray-700 text-gray-500"
                              : "bg-gray-200 text-gray-400"
                          }`
                    }`}
                    style={{
                      background: hasNextSubModule()
                        ? `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                            currentColor,
                            0.8
                          )} 100%)`
                        : undefined,
                    }}
                  >
                    Sub Modul Selanjutnya
                    <FaChevronRight />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="py-4 px-6"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <MdDescription style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Deskripsi Pembelajaran
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div
                  className={`leading-relaxed whitespace-pre-wrap ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {subModuleData.subDeskripsi}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar with Progress Tracking */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sub Module List with Progress Indicators */}
            {subModuleDataByModulId && subModuleDataByModulId.length > 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
                }}
              >
                <div
                  className="p-4"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FaListAlt style={{ color: currentColor }} />
                    <h3
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Daftar Sub Modul
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {subModuleDataByModulId.map((subModule, index) => {
                      const isCompleted = isSubModuleCompleted(subModule.id);
                      const canAccess = canAccessSubModule(index);
                      const isCurrent = parseInt(id) === subModule.id;

                      return (
                        <motion.div
                          key={subModule.id}
                          whileHover={{ scale: canAccess ? 1.02 : 1 }}
                          whileTap={{ scale: canAccess ? 0.98 : 1 }}
                          onClick={() =>
                            navigateToSubModule(subModule.id, index)
                          }
                          className={`p-3 rounded-lg transition-all duration-300 ${
                            !canAccess
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:shadow-md"
                          } ${
                            isCurrent
                              ? `text-white shadow-md`
                              : `${
                                  isDark
                                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                }`
                          }`}
                          style={{
                            background: isCurrent
                              ? `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                                  currentColor,
                                  0.8
                                )} 100%)`
                              : undefined,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCurrent
                                  ? "bg-white text-gray-800"
                                  : isCompleted
                                  ? "bg-green-500 text-white"
                                  : !canAccess
                                  ? "bg-gray-400 text-gray-600"
                                  : "bg-gray-300 text-gray-600"
                              }`}
                            >
                              {isCompleted ? (
                                <FaCheck />
                              ) : !canAccess ? (
                                <FaLock />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium line-clamp-2">
                                {subModule.subJudul}
                              </p>
                              {/* ✅ NEW: Progress indicator for students */}
                              {isSiswa && progressData && (
                                <div className="mt-1">
                                  {isCompleted ? (
                                    <span className="text-xs text-green-300">
                                      ✓ Selesai
                                    </span>
                                  ) : !canAccess ? (
                                    <span className="text-xs text-gray-400">
                                      🔒 Terkunci
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">
                                      👁 Belum dilihat
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            {isCurrent && (
                              <FaPlayCircle className="text-white text-sm" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* ✅ NEW: Overall progress bar for students */}
                  {isSiswa && progressData && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          Progress Modul
                        </span>
                        <span className="text-sm">
                          {Math.round(progressData.overallProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${progressData.overallProgress}%`,
                            backgroundColor: currentColor,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {progressData.completedSubModules} dari{" "}
                        {progressData.totalSubModules} sub modul selesai
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Rest of the sidebar components remain the same... */}
            {/* Sub Module Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="p-4"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <BsFileEarmarkText style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Info Sub Modul
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {subModuleData.url && (
                  <div className="mb-4">
                    <img
                      src={subModuleData.url}
                      alt={subModuleData.subJudul}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sub Modul:
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {subModuleData.subJudul}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Modul Induk:
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {subModuleData.modul?.judul}
                    </p>
                  </div>
                  {/* ✅ NEW: Progress info for current submodule */}
                  {isSiswa && (
                    <div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Status Pembelajaran:
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {currentProgress.isCompleted ? (
                          <div className="flex items-center gap-1 text-green-500">
                            <FaCheckCircle />
                            <span className="text-sm">Selesai</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${currentProgress.completionPercentage}%`,
                                  backgroundColor: currentColor,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.round(currentProgress.completionPercentage)}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Dibuat oleh:
                    </p>
                    <div className="flex items-center gap-2">
                      <FaUser
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {subModuleData.user?.username} (
                        {subModuleData.user?.role})
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Dibuat:
                    </p>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {formatDate(subModuleData.createdAt)}
                      </p>
                    </div>
                  </div>
                  {subModuleData.updatedAt !== subModuleData.createdAt && (
                    <div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Diperbarui:
                      </p>
                      <div className="flex items-center gap-2">
                        <FaClock
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {formatDate(subModuleData.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Learning Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="p-4"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <FaLightbulb style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {isSiswa ? "Tips Belajar" : "Info Pembelajaran"}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {isSiswa ? (
                    <>
                      <div className="flex items-start gap-2">
                        <FaSeedling
                          style={{ color: currentColor }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Tonton video dengan fokus dan catat hal-hal penting
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaLeaf
                          style={{ color: currentColor }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Selesaikan sub modul secara berurutan untuk hasil
                          optimal
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaBook
                          style={{ color: currentColor }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Gunakan tombol "Tandai Selesai" setelah memahami
                          materi
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaGraduationCap
                          style={{ color: currentColor }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Progress otomatis tersimpan dan dapat dilanjutkan
                          kapan saja
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <FaEye
                          style={{ color: currentColor }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Anda dapat melihat semua sub modul tanpa batasan
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaBook
                          style={{ color: currentColor }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Gunakan fitur navigation untuk berpindah antar konten
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="space-y-3"
            >
              <motion.button
                onClick={() =>
                  navigate(`/modul-belajar/detail/${subModuleData.modulId}`)
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <BsCollection />
                Lihat Sub Modul Lainnya
              </motion.button>

              <motion.button
                onClick={() => navigate("/modul-belajar")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 border rounded-xl text-sm font-medium transition-all duration-300 ${
                  isDark
                    ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <FaArrowLeft />
                Kembali ke Modul
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContent;
