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
  FaClipboardList,
  FaFilePdf,
  FaDownload,
  FaSearchPlus,
  FaSearchMinus,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { MdOndemandVideo, MdDescription, MdLibraryBooks, MdPictureAsPdf } from "react-icons/md";
import { BsCollection, BsFileEarmarkText } from "react-icons/bs";

const ViewContent = () => {
  const [modulId, setModulId] = useState("");
  const [siswaId, setSiswaId] = useState("");
  const [groupSoalId, setGroupSoalId] = useState(null);
  const [subModuleData, setSubModuleData] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [subModuleDataByModulId, setSubModuleDataByModulId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // PDF Viewer states
  const [pdfPages, setPdfPages] = useState([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfZoom, setPdfZoom] = useState(1);
  const [currentPdfPage, setCurrentPdfPage] = useState(0);
  const [isPdfExpanded, setIsPdfExpanded] = useState(false);

  // Progress tracking states
  const [progressData, setProgressData] = useState(null);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [isQuizDataLoading, setIsQuizDataLoading] = useState(true);
  const [quizResults, setQuizResults] = useState([]);
  const [isQuizResultsLoading, setIsQuizResultsLoading] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
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
  const isSiswa = user?.role === "siswa";

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // ✅ SIMPLIFIED PDF conversion function using PROXY ONLY
  const convertPdfToImages = async (pdfUrl) => {
    if (!pdfUrl) return;

    try {
      setIsPdfLoading(true);
      setPdfError("");
      
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      // ✅ ALWAYS use proxy endpoint - no fallbacks needed
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      
      console.log("Using PDF proxy for:", pdfUrl);
      
      const proxyResponse = await fetch(`${apiUrl}/pdf-proxy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfUrl })
      });
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy error! status: ${proxyResponse.status}`);
      }
      
      const arrayBuffer = await proxyResponse.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDocument = await loadingTask.promise;

      const pages = [];
      
      // Convert each page to image
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        
        // Set scale for better quality
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // Convert canvas to image URL
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        pages.push({
          pageNumber: pageNum,
          imageUrl: imageUrl,
          width: viewport.width,
          height: viewport.height
        });
      }

      setPdfPages(pages);
      setCurrentPdfPage(0);
      console.log(`Successfully converted ${pages.length} pages to images`);
      
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      setPdfError(`Gagal memuat file PDF: ${error.message}`);
    } finally {
      setIsPdfLoading(false);
    }
  };

  // PDF control functions
  const zoomIn = () => {
    setPdfZoom(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setPdfZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const nextPage = () => {
    setCurrentPdfPage(prev => Math.min(prev + 1, pdfPages.length - 1));
  };

  const prevPage = () => {
    setCurrentPdfPage(prev => Math.max(prev - 1, 0));
  };

  const goToPage = (pageIndex) => {
    setCurrentPdfPage(pageIndex);
  };

  const downloadPdf = () => {
    if (subModuleData?.urlPdf) {
      const link = document.createElement('a');
      link.href = subModuleData.urlPdf;
      link.download = subModuleData.namaPdf || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get current sub module index
  const getCurrentSubModuleIndex = () => {
    if (!subModuleDataByModulId || !subModuleData) return -1;
    return subModuleDataByModulId.findIndex((item) => item.id === parseInt(id));
  };

  // Check if submodule is completed
  const isSubModuleCompleted = (subModuleId) => {
    if (!progressData || !progressData.subModulesProgress) return false;
    const progress = progressData.subModulesProgress.find(
      (item) => item.subModul.id === subModuleId
    );
    return progress?.progress?.isCompleted || false;
  };

  // Check if submodule can be accessed
  const canAccessSubModule = (index) => {
    if (!isSiswa) return true;
    if (index === 0) return true;

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
        const currentPath = `/sub-modul-belajar/view/${nextSubModule.id}`;
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
    if (!subModuleDataByModulId || subModuleDataByModulId.length === 0)
      return false;
    const currentIndex = getCurrentSubModuleIndex();
    return currentIndex === subModuleDataByModulId.length - 1;
  };

  const hasQuizAvailable = () => {
    return groupSoalId !== null && groupSoalId !== undefined;
  };

  // function to navigate to the quiz page
  const navigateToQuiz = () => {
    if (groupSoalId) {
      navigate(`/start-quiz/${groupSoalId}`);
    }
  };

  const fetchQuizResults = async () => {
    try {
      setIsQuizResultsLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      const response = await axios.get(
        `${apiUrl}/student-results/${siswaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setQuizResults(response.data.data || []);

        // Cek apakah siswa sudah mengerjakan quiz untuk groupSoalId ini
        const currentSiswaId = siswaId;
        const hasCompleted = response.data.data.some(
          (result) =>
            result.siswaId === currentSiswaId &&
            result.groupSoalId === groupSoalId
        );
        setHasCompletedQuiz(hasCompleted);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setIsQuizResultsLoading(false);
    }
  };

  useEffect(() => {
    if (isSiswa && groupSoalId) {
      fetchQuizResults();
    }
  }, [isSiswa, groupSoalId]);

  // function to check can access the quiz
  const canAccessQuiz = () => {
    if (!isSiswa) return true;

    // Masih loading, disable button
    if (isProgressLoading || isQuizDataLoading || isQuizResultsLoading)
      return false;

    // Tidak ada quiz tersedia
    if (!groupSoalId) return false;

    // Jika sudah mengerjakan quiz, disable button
    if (hasCompletedQuiz) return false;

    // Kombinasi pengecekan - current module completed ATAU semua module completed
    const currentModuleCompleted = currentProgress.isCompleted;
    const allModulesCompleted =
      progressData &&
      progressData.completedSubModules >= progressData.totalSubModules;

    const result = currentModuleCompleted || allModulesCompleted;

    return result;
  };

  // Progress API functions
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

      setCurrentProgress((prev) => ({
        ...prev,
        isCompleted: true,
        completionPercentage: 100,
      }));

      // Refresh progress data
      await getProgressData();
      setShowCompleteModal(false);
    } catch (error) {
      console.error("Error marking as completed:", error);
      alert("Gagal menandai sebagai selesai");
    }
  };

  const getProgressData = async () => {
    if (!isSiswa || !modulId) {
      setIsProgressLoading(false);
      return;
    }

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
    } finally {
      setIsProgressLoading(false);
    }
  };

  const getCurrentProgressData = async () => {
    if (!isSiswa) {
      setIsProgressLoading(false);
      return;
    }

    try {
      setIsProgressLoading(true);
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
    } finally {
      setIsProgressLoading(false);
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

  // Fungsi konversi menit ke detik
  const parseTimeToSeconds = (timeString) => {
    if (!timeString) return 60;

    const parts = timeString.split(":");
    let seconds = 0;

    if (parts.length === 2) {
      seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      seconds =
        parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseInt(parts[2]);
    } else {
      seconds = 60;
    }

    return seconds;
  };

  // Simulate video progress
  const simulateVideoProgress = () => {
    if (!isSiswa || currentProgress.isCompleted || !subModuleData) return;

    const videoDurationInSeconds = parseTimeToSeconds(subModuleData.time);
    let watchTimeCounter = currentProgress.watchTime || 0;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        const newWatchTime = prev.watchTime + 5;
        watchTimeCounter = newWatchTime;

        const newPercentage = Math.min(
          (newWatchTime / videoDurationInSeconds) * 100,
          100
        );

        if (newWatchTime % 30 === 0) {
          updateProgressAPI(newWatchTime, newPercentage);
        }

        const completionThreshold = Math.floor(videoDurationInSeconds * 0.8);
        if (newWatchTime >= completionThreshold && !prev.isCompleted) {
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
    }, 5000);

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

  // useEffect hooks
  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (!isSiswa) {
      setIsProgressLoading(false);
      setIsQuizDataLoading(false);
    }
  }, [isSiswa]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getSubModulById();
      getProfileSiswa();
    } else {
      navigate("/login");
    }
  }, [navigate, id]);

  useEffect(() => {
    if (subModuleData?.time) {
      const duration = parseTimeToSeconds(subModuleData.time);
      setVideoDuration(duration);
    }
    
    // Convert PDF to images when subModuleData is loaded
    if (subModuleData?.urlPdf) {
      convertPdfToImages(subModuleData.urlPdf);
    }
  }, [subModuleData]);

  // Proper loading sequence
  useEffect(() => {
    if (modulId) {
      getSubModulByModulId();
      getModulById(); // This will set groupSoalId and isQuizDataLoading

      if (isSiswa) {
        // Load progress data in sequence
        const loadProgressData = async () => {
          await getProgressData();
          await getCurrentProgressData();
        };

        loadProgressData();
        checkAccessAPI();
      }
    }
  }, [modulId, isSiswa]);

  // Start progress and simulate video watching
  useEffect(() => {
    if (subModuleData && isSiswa && canAccess) {
      startProgress();

      const timeout = setTimeout(() => {
        const cleanup = simulateVideoProgress();
        return cleanup;
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [subModuleData, isSiswa, canAccess]);

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

  // getModulById with proper loading state
  const getModulById = async () => {
    if (!modulId) return;

    try {
      setIsQuizDataLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/modul/${modulId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      setGroupSoalId(data.group_soal?.id || null);
    } catch (error) {
      console.error("Error fetching modul data:", error);
      setError("Gagal memuat data modul");
    } finally {
      setIsQuizDataLoading(false);
    }
  };

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
    <div className="min-h-screen p-3 sm:p-6">
      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 sm:p-6 rounded-xl max-w-md w-full ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="text-center">
              <FaCheck className="text-green-500 text-3xl sm:text-4xl mx-auto mb-4" />
              <h3
                className={`text-lg sm:text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                Selamat! 🎉
              </h3>
              <p
                className={`mb-6 text-sm sm:text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Anda telah menonton{" "}
                {Math.round(currentProgress.completionPercentage)}% dari video
                ini. Tandai sebagai selesai?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={markAsCompleted}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
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
          className="mb-4 sm:mb-6"
        >
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto">
            <button
              onClick={() => navigate("/modul-belajar")}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg transition-colors duration-300 whitespace-nowrap ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <FaArrowLeft className="text-xs" />
              <span className="hidden sm:inline">Modul Belajar</span>
              <span className="sm:hidden">Modul</span>
            </button>
            <FaChevronRight
              className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}
            />
            <button
              onClick={() =>
                navigate(`/modul-belajar/detail/${subModuleData.modulId}`)
              }
              className={`px-2 sm:px-3 py-1 rounded-lg transition-colors duration-300 truncate max-w-24 sm:max-w-none ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
              title={subModuleData.modul?.judul}
            >
              {subModuleData.modul?.judul}
            </button>
            <FaChevronRight
              className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}
            />
            <span style={{ color: currentColor }} className="font-medium truncate">
              {subModuleData.subJudul}
            </span>
          </div>
        </motion.div>

        {/* Header Section with Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm border"
            style={{
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            {/* Mobile Layout */}
            <div className="sm:hidden">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="p-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentColor }}
                >
                  <MdOndemandVideo className="text-white text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1
                    className={`text-lg font-bold leading-tight ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    <span style={{ color: currentColor }}>Pembelajaran</span>{" "}
                    Interactive
                  </h1>
                  <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"} mt-1`}>
                    Green Science Learning
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isDark
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <FaBookmark
                      className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isDark
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <FaShare
                      className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
                    />
                  </motion.button>
                </div>
              </div>
              
              {/* Sub module info and progress */}
              <div className="space-y-2">
                {subModuleDataByModulId && (
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Sub Modul {currentIndex + 1} dari{" "}
                    {subModuleDataByModulId.length}
                  </p>
                )}
                
                {/* Progress and complete button */}
                <div className="flex items-center justify-between">
                  {isSiswa && (
                    <div className="flex items-center gap-2 flex-1">
                      {currentProgress.isCompleted ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <FaCheckCircle className="text-sm" />
                          <span className="text-xs">Selesai</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${currentProgress.completionPercentage}%`,
                                backgroundColor: currentColor,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {Math.round(currentProgress.completionPercentage)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {isSiswa && !currentProgress.isCompleted && (
                    <motion.button
                      onClick={() => setShowCompleteModal(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs ml-2"
                    >
                      <FaCheck className="inline mr-1" />
                      Selesai
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center gap-4">
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
                  {/* Progress indicator for students */}
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
                          {subModuleData.time && (
                            <span className="text-xs text-gray-400">
                              ({subModuleData.time})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Complete button for students */}
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

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Video Player Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              {/* Video Header */}
              <div
                className="py-3 sm:py-4 px-4 sm:px-6"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaYoutube className="text-white text-lg sm:text-xl" />
                  <h2 className="text-base sm:text-xl font-bold text-white truncate flex-1">
                    {subModuleData.subJudul}
                  </h2>
                  <div className="hidden sm:flex items-center gap-2 text-white text-sm">
                    {isSiswa && currentProgress.isCompleted && (
                      <FaCheckCircle className="text-green-300" />
                    )}
                    <FaPlay className="text-xs" />
                    <span>Video Pembelajaran</span>
                  </div>
                </div>
              </div>

              {/* Video Content */}
              <div className="p-3 sm:p-6">
                {videoId ? (
                  <div className="relative">
                    <div
                      className="relative w-full rounded-lg sm:rounded-xl overflow-hidden shadow-lg"
                      style={{ paddingBottom: "56.25%", height: 0 }}
                    >
                      {!isVideoLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <div
                              className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-4"
                              style={{
                                borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
                              }}
                            />
                            <p className="text-gray-600 text-sm sm:text-base">Memuat video...</p>
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
                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="hidden sm:flex items-center gap-1">
                          <FaVolumeUp style={{ color: currentColor }} />
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            Audio
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                          <FaExpand style={{ color: currentColor }} />
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-600"
                            }
                          >
                            Fullscreen
                          </span>
                        </div>
                        {/* Progress info for students */}
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
                              {subModuleData.time && ` / ${subModuleData.time}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <a
                        href={subModuleData.urlYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors"
                      >
                        <FaYoutube />
                        <span className="hidden sm:inline">Buka di YouTube</span>
                        <span className="sm:hidden">YouTube</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FaYoutube className="text-gray-400 text-4xl sm:text-6xl mx-auto mb-4" />
                    <p
                      className={`text-base sm:text-lg ${
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
            {subModuleDataByModulId && subModuleDataByModulId.length >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0"
              >
                <motion.button
                  onClick={navigateToPreviousSubModule}
                  disabled={!hasPreviousSubModule()}
                  whileHover={{ scale: hasPreviousSubModule() ? 1.02 : 1 }}
                  whileTap={{ scale: hasPreviousSubModule() ? 0.98 : 1 }}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
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
                  <span className="hidden sm:inline">Sub Modul Sebelumnya</span>
                  <span className="sm:hidden">Sebelumnya</span>
                </motion.button>

                <div className="text-center order-first sm:order-none">
                  <div
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {currentIndex + 1} / {subModuleDataByModulId.length}
                  </div>
                  {/* Overall progress for students */}
                  {isSiswa && progressData && (
                    <div className="text-xs text-gray-500 mt-1">
                      {progressData.completedSubModules} dari{" "}
                      {progressData.totalSubModules} selesai
                    </div>
                  )}
                </div>

                {/* Conditional button - Next SubModule or Quiz */}
                {isLastSubModule() && hasQuizAvailable() ? (
                  // Quiz Button for last submodule - ONLY for siswa
                  user.role === "siswa" ? (
                    <motion.button
                      onClick={navigateToQuiz}
                      disabled={!canAccessQuiz() || hasCompletedQuiz}
                      whileHover={{
                        scale: !canAccessQuiz() || hasCompletedQuiz ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: !canAccessQuiz() || hasCompletedQuiz ? 1 : 0.98,
                      }}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
                        !canAccessQuiz() || hasCompletedQuiz
                          ? `opacity-50 cursor-not-allowed ${
                              isDark
                                ? "bg-gray-700 text-gray-500"
                                : "bg-gray-200 text-gray-400"
                            }`
                          : `text-white shadow-lg hover:shadow-xl`
                      }`}
                      style={{
                        background:
                          !canAccessQuiz() || hasCompletedQuiz
                            ? undefined
                            : `linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)`,
                      }}
                    >
                      <FaClipboardList />
                      {isProgressLoading ||
                      isQuizDataLoading ||
                      isQuizResultsLoading
                        ? "Loading..."
                        : hasCompletedQuiz
                        ? "Anda Telah Mengerjakannya"
                        : "Kerjakan Quiz"}
                    </motion.button>
                  ) : null
                ) : !isLastSubModule() ? (
                  // Next SubModule Button - for all users
                  <motion.button
                    onClick={navigateToNextSubModule}
                    disabled={!hasNextSubModule()}
                    whileHover={{ scale: hasNextSubModule() ? 1.02 : 1 }}
                    whileTap={{ scale: hasNextSubModule() ? 0.98 : 1 }}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
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
                    <span className="hidden sm:inline">Sub Modul Selanjutnya</span>
                    <span className="sm:hidden">Selanjutnya</span>
                    <FaChevronRight />
                  </motion.button>
                ) : null}
              </motion.div>
            )}

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="py-3 sm:py-4 px-4 sm:px-6"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <MdDescription style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold text-base sm:text-lg ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Deskripsi Pembelajaran
                  </h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div
                  className={`leading-relaxed whitespace-pre-wrap text-sm sm:text-base ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {subModuleData.subDeskripsi}
                </div>
              </div>
            </motion.div>

            {/* PDF Viewer Section */}
            {subModuleData.urlPdf && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
                }}
              >
                {/* PDF Header */}
                <div
                  className="py-2.5 sm:py-4 px-3 sm:px-6"
                  style={{
                    backgroundColor: getColorWithOpacity('#dc2626', 0.1),
                  }}
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FaFilePdf style={{ color: '#dc2626' }} className="flex-shrink-0 text-base" />
                        <h3
                          className={`font-semibold text-sm truncate ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                          title={'Document.pdf'}
                        >
                          Document.pdf
                        </h3>
                      </div>
                      <button
                        onClick={() => setIsPdfExpanded(!isPdfExpanded)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        {isPdfExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                        <span>{isPdfExpanded ? 'Tutup' : 'Buka'}</span>
                      </button>
                    </div>
                    {isPdfExpanded && (
                      <button
                        onClick={downloadPdf}
                        className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <FaDownload className="text-xs" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FaFilePdf style={{ color: '#dc2626' }} className="flex-shrink-0 text-lg" />
                      <h3
                        className={`font-semibold text-lg truncate ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                        title={'Document.pdf'}
                      >
                        Materi PDF - Document.pdf
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={downloadPdf}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FaDownload />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => setIsPdfExpanded(!isPdfExpanded)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        {isPdfExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        <span>{isPdfExpanded ? 'Tutup' : 'Buka'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* PDF Content */}
                {isPdfExpanded && (
                  <div className="p-3 sm:p-6">
                    {isPdfLoading ? (
                      <div className="text-center py-6 sm:py-12">
                        <div
                          className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-4"
                          style={{
                            borderColor: `#dc2626 transparent #dc2626 #dc2626`,
                          }}
                        />
                        <p className={`text-sm sm:text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                          Memuat PDF...
                        </p>
                        <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>
                          Menggunakan proxy server
                        </p>
                      </div>
                    ) : pdfError ? (
                      <div className="text-center py-6 sm:py-12">
                        <FaFilePdf className="text-red-400 text-3xl sm:text-6xl mx-auto mb-3 sm:mb-4" />
                        <p className={`text-sm sm:text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Gagal memuat PDF
                        </p>
                        <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>
                          {pdfError}
                        </p>
                        <button
                          onClick={() => convertPdfToImages(subModuleData.urlPdf)}
                          className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                        >
                          Coba Lagi
                        </button>
                      </div>
                    ) : pdfPages.length > 0 ? (
                      <div>
                        {/* PDF Controls - Mobile */}
                        <div className="sm:hidden space-y-2 mb-3">
                          {/* Page Navigation */}
                          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <button
                              onClick={prevPage}
                              disabled={currentPdfPage === 0}
                              className="p-1.5 rounded-md bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaChevronLeft className="text-xs" />
                            </button>
                            <span className={`text-xs flex-1 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              {currentPdfPage + 1} / {pdfPages.length}
                            </span>
                            <button
                              onClick={nextPage}
                              disabled={currentPdfPage === pdfPages.length - 1}
                              className="p-1.5 rounded-md bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaChevronRight className="text-xs" />
                            </button>
                          </div>
                          
                          {/* Zoom Controls */}
                          <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <button
                              onClick={zoomOut}
                              disabled={pdfZoom <= 0.5}
                              className="p-1.5 rounded-md bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaSearchMinus className="text-xs" />
                            </button>
                            <span className={`text-xs min-w-[45px] text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              {Math.round(pdfZoom * 100)}%
                            </span>
                            <button
                              onClick={zoomIn}
                              disabled={pdfZoom >= 3}
                              className="p-1.5 rounded-md bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaSearchPlus className="text-xs" />
                            </button>
                          </div>
                        </div>

                        {/* PDF Controls - Desktop */}
                        <div className="hidden sm:flex items-center justify-between gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={prevPage}
                              disabled={currentPdfPage === 0}
                              className="p-2 rounded-lg bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaChevronLeft className="text-sm" />
                            </button>
                            <span className={`text-sm min-w-[120px] text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              Halaman {currentPdfPage + 1} dari {pdfPages.length}
                            </span>
                            <button
                              onClick={nextPage}
                              disabled={currentPdfPage === pdfPages.length - 1}
                              className="p-2 rounded-lg bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaChevronRight className="text-sm" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={zoomOut}
                              disabled={pdfZoom <= 0.5}
                              className="p-2 rounded-lg bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaSearchMinus className="text-sm" />
                            </button>
                            <span className={`text-sm min-w-[60px] text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                              {Math.round(pdfZoom * 100)}%
                            </span>
                            <button
                              onClick={zoomIn}
                              disabled={pdfZoom >= 3}
                              className="p-2 rounded-lg bg-white dark:bg-gray-600 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              <FaSearchPlus className="text-sm" />
                            </button>
                          </div>
                        </div>

                        {/* PDF Page Display */}
                        <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                          <div 
                            className="relative flex justify-center items-start p-2 sm:p-4 overflow-auto h-[50vh] sm:h-[70vh]"
                          >
                            <div 
                              className="relative inline-block"
                              style={{
                                transform: `scale(${pdfZoom})`,
                                transformOrigin: 'center top',
                                transition: 'transform 0.2s ease'
                              }}
                            >
                              <img
                                src={pdfPages[currentPdfPage]?.imageUrl}
                                alt={`PDF Page ${currentPdfPage + 1}`}
                                className="shadow-lg rounded block max-h-[65vh] w-auto h-auto"
                                style={{ 
                                  maxWidth: pdfZoom > 1 ? 'none' : '90vw',
                                  objectFit: 'contain'
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Page Thumbnails */}
                        {pdfPages.length > 1 && (
                          <div className="mt-3 sm:mt-4">
                            <h4 className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              Halaman:
                            </h4>
                            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                              {pdfPages.map((page, index) => (
                                <button
                                  key={index}
                                  onClick={() => goToPage(index)}
                                  className={`flex-shrink-0 relative ${
                                    index === currentPdfPage 
                                      ? 'ring-2 ring-red-500 shadow-md' 
                                      : 'hover:ring-1 hover:ring-gray-300'
                                  } rounded transition-all duration-200`}
                                >
                                  <img
                                    src={page.imageUrl}
                                    alt={`Page ${index + 1}`}
                                    className="w-10 h-14 sm:w-16 sm:h-20 object-cover rounded"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded-b text-center">
                                    {index + 1}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-12">
                        <MdPictureAsPdf className="text-gray-400 text-3xl sm:text-6xl mx-auto mb-3 sm:mb-4" />
                        <p className={`text-sm sm:text-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Tidak dapat memuat PDF
                        </p>
                        <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mt-1`}>
                          File PDF mungkin kosong atau tidak valid
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar with Progress Tracking */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Sub Module List with Progress Indicators */}
            {subModuleDataByModulId && subModuleDataByModulId.length >= 1 && (
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
                  className="p-3 sm:p-4"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FaListAlt style={{ color: currentColor }} />
                    <h3
                      className={`font-semibold text-sm sm:text-base ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Daftar Sub Modul
                    </h3>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
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
                          className={`p-2.5 sm:p-3 rounded-lg transition-all duration-300 ${
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
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
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
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium line-clamp-2">
                                {subModule.subJudul}
                              </p>
                              {/* Progress indicator for students */}
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
                              <FaPlayCircle className="text-white text-sm flex-shrink-0" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Overall progress bar for students */}
                  {isSiswa && progressData && (
                    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">
                          Progress Modul
                        </span>
                        <span className="text-xs sm:text-sm">
                          {Math.round(progressData.overallProgress)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
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
                className="p-3 sm:p-4"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <BsFileEarmarkText style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Info Sub Modul
                  </h3>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {subModuleData.url && (
                  <div className="mb-3 sm:mb-4">
                    <img
                      src={subModuleData.url}
                      alt={subModuleData.subJudul}
                      className="w-full h-24 sm:h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Sub Modul:
                    </p>
                    <p
                      className={`font-medium text-sm ${
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
                      className={`text-xs sm:text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {subModuleData.modul?.judul}
                    </p>
                  </div>
                  {/* PDF info */}
                  {subModuleData.urlPdf && (
                    <div>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Materi PDF:
                      </p>
                      <div className="flex items-center gap-2 mt-1 min-w-0">
                        <FaFilePdf className="text-red-500 text-sm flex-shrink-0" />
                        <p
                          className={`text-xs sm:text-sm truncate ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                          title={subModuleData.namaPdf || 'Document.pdf'}
                        >
                          {subModuleData.namaPdf || 'Document.pdf'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {pdfPages.length > 0 ? `${pdfPages.length} halaman` : 'Tersedia untuk download'}
                      </p>
                    </div>
                  )}
                  {/* Progress info for current submodule */}
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
                            <FaCheckCircle className="text-sm" />
                            <span className="text-xs sm:text-sm">Selesai</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${currentProgress.completionPercentage}%`,
                                  backgroundColor: currentColor,
                                }}
                              />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500">
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
                        className={`text-xs sm:text-sm ${
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
                        className={`text-xs sm:text-sm ${
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
                          className={`text-xs sm:text-sm ${
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
                className="p-3 sm:p-4"
                style={{
                  backgroundColor: getColorWithOpacity(currentColor, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <FaLightbulb style={{ color: currentColor }} />
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {isSiswa ? "Tips Belajar" : "Info Pembelajaran"}
                  </h3>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
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
                        <FaFilePdf
                          style={{ color: '#dc2626' }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Baca materi PDF untuk pemahaman yang lebih mendalam
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
                      <div className="flex items-start gap-2">
                        <FaFilePdf
                          style={{ color: '#dc2626' }}
                          className="text-sm mt-1 flex-shrink-0"
                        />
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          PDF viewer dengan zoom dan navigasi halaman tersedia
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
              className="space-y-2 sm:space-y-3"
            >
              <motion.button
                onClick={() =>
                  navigate(`/modul-belajar/detail/${subModuleData.modulId}`)
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 border border-transparent rounded-xl shadow-lg text-xs sm:text-sm font-medium text-white transition-all duration-300 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <BsCollection />
                <span className="hidden sm:inline">Lihat Sub Modul Lainnya</span>
                <span className="sm:hidden">Sub Modul Lain</span>
              </motion.button>

              <motion.button
                onClick={() => navigate("/modul-belajar")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 border rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isDark
                    ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <FaArrowLeft />
                <span className="hidden sm:inline">Kembali ke Modul</span>
                <span className="sm:hidden">Kembali</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContent;