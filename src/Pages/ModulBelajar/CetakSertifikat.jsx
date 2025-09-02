import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaCertificate,
  FaCheckCircle,
  FaLeaf,
  FaSeedling,
  FaGlobeAmericas,
  FaRecycle,
  FaEye,
  FaExclamationTriangle,
  FaSpinner,
  FaUser,
  FaGraduationCap,
  FaExpand,
  FaImage,
  FaTrophy,
  FaStar,
  FaFileAlt,
} from "react-icons/fa";
import { MdEco, MdQuiz } from "react-icons/md";

const CetakSertifikat = () => {
  const [siswaData, setSiswaData] = useState(null);
  const [modulData, setModulData] = useState(null);
  const [nilaiData, setNilaiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [certificateData, setCertificateData] = useState(null);

  // Image Certificate states
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const { modulId, nilaiId } = useParams();
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

  // Green theme colors
  const greenTheme = {
    primary: "#10b981", // emerald-500
    secondary: "#34d399", // emerald-400
    accent: "#059669", // emerald-600
    light: "#d1fae5", // emerald-100
    dark: "#064e3b", // emerald-900
  };

  // Template URL - ganti dengan image (JPG/PNG)
  const templateUrl = `${process.env.REACT_APP_URL_API}/templates/certificate-template.jpg`;

  const formatTanggalIndonesia = (date) => {
    const bulanIndonesia = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    let tanggalObj;

    // Jika input adalah string, parse ke Date object
    if (typeof date === "string") {
      tanggalObj = new Date(date);
    } else if (date instanceof Date) {
      tanggalObj = date;
    } else {
      tanggalObj = new Date(); // gunakan tanggal sekarang jika input tidak valid
    }

    const hari = tanggalObj.getDate();
    const bulan = bulanIndonesia[tanggalObj.getMonth()];
    const tahun = tanggalObj.getFullYear();

    return `${hari} ${bulan} ${tahun}`;
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (!isSiswa) {
      navigate("/dashboard");
      return;
    }

    // ✅ Validate required parameters
    if (!modulId || !nilaiId) {
      setError("Parameter modulId dan nilaiId diperlukan");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      loadAllData();
    } else {
      navigate("/login");
    }
  }, [navigate, isSiswa, modulId, nilaiId]);

  // ✅ Load all required data in sequence
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load data in parallel for better performance
      await Promise.all([getProfileSiswa(), getModulById(), getNilaiById()]);

      // Check for existing certificate after all data is loaded
      await checkExistingCertificate();
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

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
        setSiswaData(response.data.data);
      }
    } catch (error) {
      console.error("Error mengambil profile siswa:", error);
      throw new Error("Gagal memuat data siswa");
    }
  };

  const getNilaiById = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/quiz-result/${nilaiId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setNilaiData(response.data.data);
      } else {
        throw new Error("Data nilai tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching nilai:", error);
      throw new Error("Gagal memuat data nilai");
    }
  };

  const getModulById = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/modul/${modulId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setModulData(response.data);
      } else {
        throw new Error("Data modul tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching modul:", error);
      if (error.response?.status === 404) {
        throw new Error("Modul tidak ditemukan!");
      } else {
        throw new Error("Gagal memuat data modul");
      }
    }
  };

  const drawModuleTitle = (ctx, canvas, modulData) => {
    // Prepare the text
    const moduleText = modulData.judul;
    const maxWidth = canvas.width * 0.6; // 70% of canvas width for text wrapping

    // Set initial font properties
    ctx.textAlign = "center";
    ctx.fillStyle = "#02612f"; // Dark green color

    // Calculate font size based on canvas size and text length
    let fontSize = Math.min(
      canvas.width * 0.03, // Base size relative to canvas width
      Math.max(36, canvas.width / (moduleText.length * 0.8)) // Minimum 36px, adjusted for text length
    );

    // Set the font with multiple fallbacks for better compatibility
    ctx.font = `bold ${fontSize}px "Playfair Display", "Times New Roman", "Georgia", serif`;

    // Check if text fits in one line, if not, wrap it
    const textMetrics = ctx.measureText(moduleText);

    if (textMetrics.width > maxWidth) {
      // Text wrapping logic for long module titles
      let line1 = "";

      // Draw two lines with proper spacing
      const startY = canvas.height * 0.485; // Slightly higher to accommodate two lines

      // Add subtle shadow effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw first line
      ctx.fillText(line1.trim(), canvas.width / 2, startY);
    } else {
      // Single line - center it perfectly
      const yPosition = canvas.height * 0.5;

      // Add subtle shadow effect
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw the text
      ctx.fillText(moduleText, canvas.width / 2, yPosition);
    }

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Optional: Add decorative elements around the text
    drawDecorativeElements(ctx, canvas);
  };

  // Optional decorative elements function
  const drawDecorativeElements = (ctx, canvas) => {
    const centerX = canvas.width / 2;
    const decorY = canvas.height * 0.53; // Below the text

    // Save current context
    ctx.save();

    // Draw small decorative line elements
    ctx.strokeStyle = "#10b981"; // Emerald color
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // Left decorative line
    ctx.beginPath();
    ctx.moveTo(centerX - 100, decorY);
    ctx.lineTo(centerX - 40, decorY);
    ctx.stroke();

    // Right decorative line
    ctx.beginPath();
    ctx.moveTo(centerX + 40, decorY);
    ctx.lineTo(centerX + 100, decorY);
    ctx.stroke();

    // Small decorative dots
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(centerX - 30, decorY, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX + 30, decorY, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Restore context
    ctx.restore();
  };

  const checkExistingCertificate = async () => {
    if (!siswaData?.id) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/certificate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Check for existing certificate with nilaiId
      const existingCert = response.data.find(
        (cert) =>
          cert.modulId === parseInt(modulId) &&
          cert.siswaId === siswaData.id &&
          cert.nilaiId === parseInt(nilaiId)
      );

      if (existingCert) {
        setCertificateData(existingCert);
      }
    } catch (error) {
      console.error("Error checking existing certificate:", error);
    }
  };

  // ✅ Enhanced canvas generation with score details
  const generateCertificateCanvas = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image || !siswaData || !modulData || !nilaiData) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size to image size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Draw the background image
    ctx.drawImage(image, 0, 0);

    // Set text properties
    const currentDate = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // ✅ Enhanced certificate content with score details

    // Draw no sertifikat (center, larger font)
    ctx.font = "normal 40px Times, serif";
    ctx.fillStyle = "#000000"; // black
    ctx.textAlign = "center";
    const certId = `CERT-${siswaData.nis}-${modulData.id}-${nilaiData.id}`;
    const certX = canvas.width / 2;
    const certY = canvas.height * 0.18;
    ctx.fillText(`${certId}`, canvas.width / 2, canvas.height * 0.18);

    const textMetrics = ctx.measureText(certId);
    const textWidth = textMetrics.width;

    // Draw underline
    ctx.strokeStyle = "#000000"; // Same color as text
    ctx.lineWidth = 2; // Thickness of underline
    ctx.lineCap = "round"; // Rounded line ends

    ctx.beginPath();
    ctx.moveTo(certX - textWidth / 2, certY + 8); // Start 8px below text baseline
    ctx.lineTo(certX + textWidth / 2, certY + 8); // End at text width
    ctx.stroke();

    // Draw nama siswa (center, larger font)
    ctx.font = "normal 92px Cinzel, Times, serif";
    ctx.fillStyle = "#02612f"; // green-900
    ctx.textAlign = "center";
    ctx.fillText(
      siswaData.nama.toUpperCase(),
      canvas.width / 2,
      canvas.height * 0.37
    );

    // Draw judul modul (below nama)
    drawModuleTitle(ctx, canvas, modulData);

    // ✅ Enhanced bottom section
    ctx.textAlign = "left";

    // Tanggal
    ctx.font = "normal 36px Poppins, Arial, sans-serif";
    ctx.fillStyle = "#000000"; // black
    ctx.fillText(currentDate, canvas.width * 0.77, canvas.height * 0.765);

    // Durasi
    ctx.font = "normal 36px Poppins, Arial, sans-serif";
    ctx.fillStyle = "#000000"; // black
    ctx.fillText(
      nilaiData.groupSoal.durasi + " Jam",
      canvas.width * 0.353,
      canvas.height * 0.77
    );

    // Tanggal Penyelesaian
    ctx.font = "normal 36px Poppins, Arial, sans-serif";
    ctx.fillStyle = "#000000"; // black
    ctx.fillText(
      formatTanggalIndonesia(nilaiData.updatedAt),
      canvas.width * 0.353,
      canvas.height * 0.809
    );

    // ✅ Draw score details (enhanced)
    const score = parseFloat(nilaiData.skor).toFixed(0);

    // Main score
    ctx.font = "normal 36px Poppins, Arial, sans-serif";
    ctx.fillStyle = "#000000"; // black
    ctx.fillText(score, canvas.width * 0.353, canvas.height * 0.8443);

    setCanvasReady(true);
  };

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(null);
    generateCertificateCanvas();
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(
      "Gagal memuat template certificate. Pastikan file template tersedia."
    );
  };

  // Update canvas when data changes
  useEffect(() => {
    if (
      imageRef.current &&
      imageRef.current.complete &&
      siswaData &&
      modulData &&
      nilaiData
    ) {
      generateCertificateCanvas();
    }
  }, [siswaData, modulData, nilaiData]);

  const generateCertificate = async () => {
    if (
      !siswaData?.id ||
      !modulId ||
      !nilaiId ||
      !canvasReady ||
      !canvasRef.current
    ) {
      setError("Data tidak lengkap untuk generate sertifikat");
      return;
    }

    try {
      setGenerating(true);
      setError("");

      // ✅ Get image data from canvas
      const canvas = canvasRef.current;

      // Ensure canvas is ready and has content
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas belum siap atau kosong");
      }

      // Convert canvas to base64 image data (PNG format, high quality)
      const imageData = canvas.toDataURL("image/png", 1.0);

      // Verify image data is valid
      if (!imageData || imageData === "data:,") {
        throw new Error("Gagal mengambil data gambar dari canvas");
      }

      console.log("Sending canvas image data to backend...");

      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;

      // ✅ Include nilaiId in request
      const response = await axios.post(
        `${apiUrl}/certificate`,
        {
          siswaId: siswaData.id,
          modulId: parseInt(modulId),
          nilaiId: parseInt(nilaiId),
          imageData: imageData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCertificateData(response.data.certificate);
      setSuccess("Sertifikat berhasil digenerate!");

      // ✅ Show additional info from response
      if (response.data.additionalInfo) {
        console.log("Certificate generated successfully:", {
          certificateId: response.data.additionalInfo.certificateId,
          grade: response.data.additionalInfo.gradeInfo?.grade,
          fileInfo: response.data.additionalInfo.fileInfo,
        });
      }
    } catch (error) {
      console.error("Error generating certificate:", error);

      if (error.response?.status === 400) {
        const errorMsg =
          error.response.data.msg ||
          "Data tidak valid atau certificate sudah ada";
        setError(errorMsg);
      } else if (error.response?.status === 404) {
        setError("Data nilai atau modul tidak ditemukan");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Gagal generate sertifikat. Silakan coba lagi.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!canvasReady || !canvasRef.current) {
      setError("Certificate belum siap untuk didownload");
      return;
    }

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    const filename = `certificate-${siswaData?.nama || "unknown"}-${
      modulData?.judul || "module"
    }-${nilaiData?.skor || "score"}.png`;
    link.download = filename;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  const printCertificate = () => {
    if (!canvasReady || !canvasRef.current) {
      setError("Certificate belum siap untuk diprint");
      return;
    }

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png", 1.0);

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate - ${siswaData?.nama}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Certificate" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ✅ Enhanced grade calculation helper
  const getGradeInfo = (score) => {
    if (score >= 90) {
      return { grade: "EXCELLENT", color: "#059669", icon: "🏆" };
    } else if (score >= 80) {
      return { grade: "VERY GOOD", color: "#16a34a", icon: "⭐" };
    } else if (score >= 70) {
      return { grade: "GOOD", color: "#ca8a04", icon: "👍" };
    } else if (score >= 60) {
      return { grade: "SATISFACTORY", color: "#ea580c", icon: "👌" };
    } else {
      return { grade: "NEEDS IMPROVEMENT", color: "#dc2626", icon: "📈" };
    }
  };

  // Access denied for non-students
  if (!isSiswa) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full max-w-md"
        >
          <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl">
            <FaExclamationTriangle className="text-red-500 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-sm sm:text-base text-red-700 mb-3 sm:mb-4">
              Halaman ini hanya dapat diakses oleh siswa
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"
            style={{
              borderColor: `${greenTheme.primary} transparent ${greenTheme.primary} ${greenTheme.primary}`,
            }}
          />
          <p
            className={`text-base sm:text-lg ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            Memuat data sertifikat...
          </p>
        </motion.div>
      </div>
    );
  }

  // ✅ Error state for missing data
  if (error && (!siswaData || !modulData || !nilaiData)) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full max-w-md"
        >
          <div className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl">
            <FaExclamationTriangle className="text-red-500 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
              Data Tidak Lengkap
            </h3>
            <p className="text-sm sm:text-base text-red-700 mb-3 sm:mb-4">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                Kembali
              </button>
              <button
                onClick={() => loadAllData()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const gradeInfo = nilaiData ? getGradeInfo(nilaiData.skor) : null;

  return (
    <div className="min-h-screen p-3 sm:p-6">
      {/* Background Pattern - Hidden on mobile for better performance */}
      <div className="hidden lg:block fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <FaLeaf className="absolute top-20 left-10 text-8xl animate-pulse text-green-500" />
          <MdEco className="absolute top-40 right-20 text-6xl animate-bounce text-green-400" />
          <FaSeedling className="absolute bottom-40 left-20 text-7xl animate-pulse text-green-600" />
          <FaGlobeAmericas className="absolute bottom-20 right-10 text-6xl animate-pulse text-blue-500" />
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
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-300 text-sm sm:text-base ${
              isDark
                ? "text-gray-300 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FaArrowLeft className="text-sm" />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div
            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg backdrop-blur-sm border"
            style={{
              backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
              borderColor: getColorWithOpacity(greenTheme.primary, 0.2),
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div
                className="p-2 sm:p-3 rounded-full"
                style={{ backgroundColor: greenTheme.primary }}
              >
                <FaCertificate className="text-white text-xl sm:text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h1
                  className={`text-xl sm:text-2xl lg:text-3xl font-bold break-words ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  <span style={{ color: greenTheme.primary }}>Cetak</span>{" "}
                  Sertifikat
                </h1>
                <p
                  className={`text-sm sm:text-base break-words ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  GreenSys Learning Certificate
                </p>
                <p
                  className={`text-xs sm:text-sm mt-1 break-words ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {modulData?.judul}
                </p>
                {gradeInfo && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      style={{ color: gradeInfo.color }}
                      className="font-semibold text-sm sm:text-base"
                    >
                      {gradeInfo.icon} {gradeInfo.grade}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      ({nilaiData?.skor}/100)
                    </span>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <FaImage className="text-green-500 text-xl sm:text-2xl" />
                <FaRecycle
                  className="text-blue-500 text-lg sm:text-xl animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - Certificate Preview */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(
                  greenTheme.primary,
                  0.2
                )}`,
              }}
            >
              <div
                className="py-3 sm:py-4 px-4 sm:px-6"
                style={{
                  background: `linear-gradient(135deg, ${greenTheme.primary} 0%, ${greenTheme.secondary} 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <FaEye className="text-white text-lg sm:text-xl flex-shrink-0" />
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">
                      <span className="hidden sm:inline">
                        Preview Sertifikat Real-time
                      </span>
                      <span className="sm:hidden">Preview Sertifikat</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <FaExpand className="text-white text-sm" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-6">
                {/* Certificate Preview Container */}
                <div
                  className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                    isFullscreen ? "fixed inset-4 z-50 bg-white" : ""
                  }`}
                >
                  {imageLoading && (
                    <div className="flex items-center justify-center h-48 sm:h-64 lg:h-96">
                      <div className="text-center">
                        <FaSpinner className="text-2xl sm:text-3xl lg:text-4xl text-gray-400 animate-spin mx-auto mb-3 sm:mb-4" />
                        <p className="text-gray-600 text-sm sm:text-base">
                          <span className="hidden sm:inline">
                            Memuat template certificate...
                          </span>
                          <span className="sm:hidden">Memuat template...</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {imageError && (
                    <div className="flex items-center justify-center min-h-[200px] sm:h-64 lg:h-96 p-4">
                      <div className="text-center p-4 sm:p-8 bg-red-50 rounded-lg max-w-md w-full">
                        <FaExclamationTriangle className="text-2xl sm:text-3xl lg:text-4xl text-red-500 mx-auto mb-3 sm:mb-4" />
                        <p className="text-red-700 mb-2 font-medium text-sm sm:text-base">
                          Error Loading Template
                        </p>
                        <p className="text-red-600 text-xs sm:text-sm mb-3 sm:mb-4 break-words">
                          {imageError}
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setImageError(null);
                              setImageLoading(true);
                              if (imageRef.current) {
                                imageRef.current.src =
                                  templateUrl + "?t=" + Date.now();
                              }
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                          >
                            Coba Lagi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!imageError && (
                    <div className="relative">
                      {/* Hidden image for loading template */}
                      <img
                        ref={imageRef}
                        src={templateUrl}
                        alt="Certificate Template"
                        style={{ display: "none" }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        crossOrigin="anonymous"
                      />

                      {/* Canvas for certificate generation */}
                      <canvas
                        ref={canvasRef}
                        style={{
                          width: "100%",
                          height: "auto",
                          maxWidth: "100%",
                          border: "1px solid #e5e7eb",
                        }}
                        className="rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  {isFullscreen && (
                    <button
                      onClick={toggleFullscreen}
                      className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* ✅ Enhanced Certificate Info */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FaCheckCircle className="text-green-600" />
                    <span className="font-medium text-green-800 text-sm sm:text-base">
                      <span className="hidden sm:inline">
                        Preview Real-time Certificate
                      </span>
                      <span className="sm:hidden">Preview Certificate</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-600">Nama Siswa:</p>
                      <p className="font-medium text-gray-800 break-words">
                        {siswaData?.nama || "Loading..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">NIS:</p>
                      <p className="font-medium text-gray-800">
                        {siswaData?.nis || "Loading..."}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-gray-600">Modul:</p>
                      <p className="font-medium text-gray-800 break-words">
                        {modulData?.judul || "Loading..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Skor:</p>
                      <p className="font-medium text-gray-800">
                        {nilaiData
                          ? `${parseFloat(nilaiData.skor).toFixed(1)}/100`
                          : "Loading..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Jawaban Benar:</p>
                      <p className="font-medium text-gray-800">
                        {nilaiData
                          ? `${nilaiData.jumlahJawabanBenar}/${nilaiData.jumlahSoal}`
                          : "Loading..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Grade:</p>
                      <p
                        className="font-medium break-words"
                        style={{ color: gradeInfo?.color || "#6b7280" }}
                      >
                        {gradeInfo
                          ? `${gradeInfo.icon} ${gradeInfo.grade}`
                          : "Loading..."}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tanggal:</p>
                      <p className="font-medium text-gray-800">
                        {new Date().toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Format:</p>
                      <p className="font-medium text-gray-800">
                        High Quality PNG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            >
              {!certificateData ? (
                <motion.button
                  onClick={generateCertificate}
                  disabled={
                    generating ||
                    !siswaData ||
                    !modulData ||
                    !nilaiData ||
                    !canvasReady
                  }
                  whileHover={{ scale: generating ? 1 : 1.02 }}
                  whileTap={{ scale: generating ? 1 : 0.98 }}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg sm:rounded-xl font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto ${
                    generating || !canvasReady
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${greenTheme.primary} 0%, ${greenTheme.accent} 100%)`,
                  }}
                >
                  {generating ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCertificate />
                  )}
                  {generating ? "Generating..." : "Generate Sertifikat"}
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={downloadCertificate}
                    disabled={!canvasReady}
                    whileHover={{ scale: canvasReady ? 1.02 : 1 }}
                    whileTap={{ scale: canvasReady ? 0.98 : 1 }}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg sm:rounded-xl font-medium text-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto ${
                      !canvasReady ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${greenTheme.primary} 0%, ${greenTheme.accent} 100%)`,
                    }}
                  >
                    <FaDownload />
                    Download PNG
                  </motion.button>

                  <motion.button
                    onClick={printCertificate}
                    disabled={!canvasReady}
                    whileHover={{ scale: canvasReady ? 1.02 : 1 }}
                    whileTap={{ scale: canvasReady ? 0.98 : 1 }}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 border-2 text-sm sm:text-base w-full sm:w-auto ${
                      !canvasReady ? "opacity-70 cursor-not-allowed" : ""
                    } ${
                      isDark
                        ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-gray-900"
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    }`}
                  >
                    <FaPrint />
                    Print Certificate
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Info panels */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Student Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(
                  greenTheme.primary,
                  0.2
                )}`,
              }}
            >
              <div
                className="p-3 sm:p-4"
                style={{
                  backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <FaUser style={{ color: greenTheme.primary }} />
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Informasi Siswa
                  </h3>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Nama Lengkap:
                    </p>
                    <p
                      className={`font-medium text-sm sm:text-base break-words ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {siswaData?.nama || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      NIS:
                    </p>
                    <p
                      className={`font-medium text-sm sm:text-base ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {siswaData?.nis || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Role:
                    </p>
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-blue-500" />
                      <p
                        className={`font-medium text-sm sm:text-base ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        Siswa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ✅ Quiz Results Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(
                  greenTheme.primary,
                  0.2
                )}`,
              }}
            >
              <div
                className="p-3 sm:p-4"
                style={{
                  backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <MdQuiz style={{ color: greenTheme.primary }} />
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Hasil Quiz
                  </h3>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-3">
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Modul:
                    </p>
                    <p
                      className={`font-medium text-sm sm:text-base break-words ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {modulData?.judul || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Skor Final:
                    </p>
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-500" />
                      <p
                        className={`font-medium text-base sm:text-lg ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {nilaiData
                          ? `${parseFloat(nilaiData.skor).toFixed(1)}/100`
                          : "Loading..."}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Jawaban Benar:
                    </p>
                    <p
                      className={`font-medium text-sm sm:text-base ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {nilaiData
                        ? `${nilaiData.jumlahJawabanBenar} dari ${nilaiData.jumlahSoal} soal`
                        : "Loading..."}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Grade:
                    </p>
                    <div className="flex items-center gap-2">
                      {gradeInfo && (
                        <>
                          <span className="text-base sm:text-lg">
                            {gradeInfo.icon}
                          </span>
                          <p
                            className="font-medium text-sm sm:text-base break-words"
                            style={{ color: gradeInfo.color }}
                          >
                            {gradeInfo.grade}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Template Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="rounded-lg sm:rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(
                  greenTheme.primary,
                  0.2
                )}`,
              }}
            >
              <div
                className="p-3 sm:p-4"
                style={{
                  backgroundColor: getColorWithOpacity(greenTheme.primary, 0.1),
                }}
              >
                <div className="flex items-center gap-2">
                  <FaImage style={{ color: greenTheme.primary }} />
                  <h3
                    className={`font-semibold text-sm sm:text-base ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Template Info
                  </h3>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FaImage className="text-green-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Template image dengan Canvas API overlay
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaLeaf className="text-green-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Include skor quiz dan grade otomatis
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaDownload className="text-blue-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Download PNG berkualitas tinggi
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaPrint className="text-blue-500 text-sm mt-1 flex-shrink-0" />
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Print ready format
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 sm:bottom-20 left-4 right-4 sm:right-4 sm:left-auto z-[9998] max-w-sm sm:max-w-md sm:ml-auto"
            style={{
              zIndex: 9998,
            }}
          >
            <div
              className={`p-3 sm:p-4 rounded-xl shadow-2xl border backdrop-blur-sm ${
                error
                  ? "bg-red-50/95 border-red-200 text-red-800"
                  : "bg-green-50/95 border-green-200 text-green-800"
              }`}
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={`p-1 rounded-full flex-shrink-0 ${
                      error ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    {error ? (
                      <FaExclamationTriangle className="text-red-600 text-sm" />
                    ) : (
                      <FaCheckCircle className="text-green-600 text-sm" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">
                      {error ? "Error!" : "Success!"}
                    </p>
                    <p className="text-xs mt-1 break-words">
                      {error || success}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setError("");
                    setSuccess("");
                  }}
                  className={`p-1 rounded-full hover:bg-opacity-20 transition-colors flex-shrink-0 ml-2 ${
                    error
                      ? "hover:bg-red-600 text-red-600"
                      : "hover:bg-green-600 text-green-600"
                  }`}
                >
                  <FaArrowLeft className="text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CetakSertifikat;
