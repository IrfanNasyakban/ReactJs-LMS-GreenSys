/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiCheckCircle,
  FiHome,
  FiClock,
  FiBookOpen,
} from "react-icons/fi";
import { 
  FaLeaf,
  FaAward,
  FaSeedling, 
  FaTree, 
  FaRecycle,
  FaGraduationCap,
  FaChartLine,
  FaTrophy,
  FaArrowLeft,
  FaRedo,
  FaCertificate
} from "react-icons/fa";
import { 
  MdScience, 
  MdEco, 
  MdOutlineScience,
  MdQuiz 
} from "react-icons/md";
import { 
  GiPlantSeed, 
  GiEcology 
} from "react-icons/gi";

const HasilAkhir = () => {
  const [skor, setSkor] = useState("");
  const [jumlahSoal, setJumlahSoal] = useState("");
  const [jumlahJawabanBenar, setJumlahJawabanBenar] = useState("");
  const [modulId, setModulId] = useState("");
  const [judulModul, setJudulModul] = useState("");
  const [kelas, setKelas] = useState("");
  const [nama, setNama] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [judulGroupSoal, setJudulGroupSoal] = useState("");
  const [groupSoalId, setGroupSoalId] = useState(""); // Tambahan state untuk groupSoalId
  const [loading, setLoading] = useState(true);

  const { currentColor, currentMode } = useStateContext();
  const { id } = useParams();
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
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getNilaiById();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const getNilaiById = async () => {
    const token = localStorage.getItem("accessToken");
    const apiUrl = process.env.REACT_APP_URL_API;
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/quiz-result/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSkor(response.data.data.skor);
      setJumlahSoal(response.data.data.jumlahSoal);
      setJumlahJawabanBenar(response.data.data.jumlahJawabanBenar);
      setKelas(response.data.data.siswa.kelas.namaKelas);
      setJudulGroupSoal(response.data.data.groupSoal.judul);
      setGroupSoalId(response.data.data.groupSoal.id); // Ambil groupSoalId dari response
      setModulId(response.data.data.groupSoal.modul?.id || "Green Science Module");
      setJudulModul(response.data.data.groupSoal.modul?.judul || "Green Science Module");
      setNama(response.data.data.siswa.nama);
      setUpdatedAt(formatDateTime(response.data.data.updatedAt));
    } catch (error) {
      console.error("Error fetching nilai:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Tidak Tersedia';
  
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Waktu Tidak Valid';
      }
  
      const formattedDate = date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  
      const formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
  
      return `${formattedDate}, ${formattedTime} WIB`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tidak Tersedia';
    }
  };

  // Helper function to get grade level and color
  const getGradeInfo = (score) => {
  if (score >= 85) return { 
    level: "Sangat Baik", 
    color: "#10b981", 
    icon: <FaTree className="w-8 h-8" />,
    badgeIcon: <FaTrophy className="w-6 h-6" style={{ color: "#10b981" }} />,
    description: "Luar biasa! Pemahaman Anda tentang konsep green science sangat mendalam!",
    bgPattern: <GiEcology className="text-9xl opacity-10" />
  };
  if (score >= 70) return { 
    level: "Baik", 
    color: "#059669", 
    icon: <FaSeedling className="w-8 h-8" />,
    badgeIcon: <FaAward className="w-6 h-6" style={{ color: "#059669" }} />,
    description: "Bagus! Pemahaman yang solid, terus kembangkan pengetahuan hijau Anda!",
    bgPattern: <GiPlantSeed className="text-9xl opacity-10" />
  };
  if (score >= 55) return { 
    level: "Cukup", 
    color: "#f59e0b", 
    icon: <FaLeaf className="w-8 h-8" />,
    badgeIcon: <MdEco className="w-6 h-6" style={{ color: "#f59e0b" }} />,
    description: "Tidak buruk! Masih ada ruang untuk meningkatkan pemahaman sustainability.",
    bgPattern: <FaLeaf className="text-9xl opacity-10" />
  };
  return { 
    level: "Perlu Peningkatan", 
    color: "#ef4444", 
    icon: <FaRecycle className="w-8 h-8" />,
    badgeIcon: <FaRedo className="w-6 h-6" style={{ color: "#ef4444" }} />,
    description: "Jangan menyerah! Terus belajar dan praktikkan konsep green science.",
    bgPattern: <FaRecycle className="text-9xl opacity-10" />
  };
};

  const handleBackToHome = () => {
    navigate("/dashboard");
  };

  const handleBackToQuiz = () => {
    navigate(`/nilai-saya`);
  };

  const handleCetakSertifikat = () => {
    navigate(`/cetak-sertifikat/${modulId}/${id}`);
  };

  // Tambahan function untuk handle kerjakan ulang
  const handleKerjakanUlang = () => {
    navigate(`/start-quiz/${groupSoalId}`);
  };

  const gradeInfo = getGradeInfo(parseFloat(skor));

  const Counter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      const targetValue = parseFloat(value) || 0;
      const increment = targetValue / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setCount(targetValue);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }, [value, duration]);
    
    return Math.round(count);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
            }}
          />
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
            Memuat Hasil Quiz
          </h3>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Mengkalkulasi skor Anda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{
      backgroundColor: isDark ? "#111827" : "#f8fafc"
    }}>
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ opacity: 0.03 }}>
          <MdScience
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <GiEcology
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "1s" }}
          />
          <GiPlantSeed
            className="absolute bottom-40 left-20 text-7xl animate-pulse"
            style={{ color: currentColor, animationDelay: "0.5s" }}
          />
          <MdOutlineScience
            className="absolute bottom-20 right-10 text-8xl animate-pulse"
            style={{ color: currentColor, animationDelay: "2s" }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div
            className="p-6 rounded-2xl shadow-lg border overflow-hidden relative"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <MdQuiz className="w-full h-full" style={{ color: currentColor }} />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToQuiz}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: getColorWithOpacity(currentColor, 0.1),
                    color: currentColor
                  }}
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Hasil Quiz GreenSys
                  </h1>
                  <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Quiz Green Science telah selesai
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {jumlahJawabanBenar}/{jumlahSoal}
                  </div>
                  <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Benar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl shadow-2xl overflow-hidden border"
          style={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: getColorWithOpacity(currentColor, 0.2),
          }}
        >
          {/* Header with Gradient */}
          <div
            className="p-8 text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
            }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-20">
              {gradeInfo.bgPattern}
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FaGraduationCap className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{nama}</h2>
                  <p className="text-xl opacity-90">Kelas {kelas}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 opacity-90">Quiz Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiBookOpen className="w-4 h-4" />
                      <span className="text-sm">{judulGroupSoal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdScience className="w-4 h-4" />
                      <span className="text-sm">{judulModul}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm">{updatedAt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                    {gradeInfo.badgeIcon}
                    <span className="font-semibold">{gradeInfo.level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="p-8">
            {/* Large Score Display */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                className="relative inline-block"
              >
                <div 
                  className="w-64 h-64 rounded-full border-8 flex items-center justify-center relative mx-auto mb-6"
                  style={{ borderColor: gradeInfo.color }}
                >
                  {/* Animated background */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-10"
                    style={{ backgroundColor: gradeInfo.color }}
                  />
                  
                  <div className="text-center z-10">
                    <div className="mb-4 flex justify-center" style={{ color: gradeInfo.color }}>
                      {gradeInfo.icon}
                    </div>
                    <h2 className="text-6xl font-bold mb-2" style={{ color: gradeInfo.color }}>
                      <Counter value={skor} />%
                    </h2>
                    <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Skor Anda
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Grade Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-xl border-l-4 max-w-2xl mx-auto"
                style={{
                  backgroundColor: getColorWithOpacity(gradeInfo.color, 0.05),
                  borderColor: gradeInfo.color
                }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full" style={{ backgroundColor: getColorWithOpacity(gradeInfo.color, 0.1) }}>
                    <FaChartLine className="w-6 h-6" style={{ color: gradeInfo.color }} />
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {gradeInfo.level}
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {gradeInfo.description}
                </p>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {/* Correct Answers */}
              <div
                className="p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 border"
                style={{
                  backgroundColor: isDark ? "#374151" : "#ffffff",
                  borderColor: getColorWithOpacity(currentColor, 0.2),
                }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity("#10b981", 0.1) }}
                  >
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h4 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <Counter value={jumlahJawabanBenar} duration={1500} /> / {jumlahSoal}
                </h4>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                  Jawaban Benar
                </p>
              </div>

              {/* Score Percentage */}
              <div
                className="p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 border"
                style={{
                  backgroundColor: isDark ? "#374151" : "#ffffff",
                  borderColor: getColorWithOpacity(currentColor, 0.2),
                }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FiBarChart2 className="w-6 h-6" style={{ color: currentColor }} />
                  </div>
                </div>
                <h4 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <Counter value={skor} duration={1500} />%
                </h4>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                  Persentase Skor
                </p>
              </div>

              {/* Achievement Badge */}
              <div
                className="p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 border"
                style={{
                    backgroundColor: isDark ? "#374151" : "#ffffff",
                    borderColor: getColorWithOpacity(currentColor, 0.2),
                }}
                >
                <div className="flex items-center justify-center mb-4">
                    <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(gradeInfo.color, 0.1) }}
                    >
                    {/* Tambahkan style color pada badgeIcon */}
                    <div style={{ color: gradeInfo.color }}>
                        {gradeInfo.badgeIcon}
                    </div>
                    </div>
                    </div>
                    <h4 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`} style={{ color: gradeInfo.color }}>
                        {gradeInfo.level}
                    </h4>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                        Tingkat Pencapaian
                    </p>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <button
                onClick={handleBackToHome}
                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                }}
              >
                <FiHome className="w-5 h-5" />
                Kembali ke Dashboard
              </button>

              {/* Conditional Button: Cetak Sertifikat (skor >= 70) atau Kerjakan Ulang (skor < 70) */}
              {parseFloat(skor) >= 70 ? (
                <button
                  onClick={handleCetakSertifikat}
                  className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 border-2 hover:shadow-lg transform hover:scale-105 ${
                    isDark
                      ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaCertificate className="w-5 h-5" />
                  Cetak Sertifikat
                </button>
              ) : (
                <button
                  onClick={handleKerjakanUlang}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 bg-orange-500 hover:bg-orange-600"
                >
                  <FaRedo className="w-5 h-5" />
                  Kerjakan Ulang
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <div
            className="p-6 rounded-xl shadow-lg border"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex items-center justify-center mb-4">
              <div
                className="p-3 rounded-full mr-3"
                style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
              >
                <FaSeedling className="w-6 h-6" style={{ color: currentColor }} />
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                GreenSys Learning Platform
              </span>
            </div>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed max-w-3xl mx-auto`}>
              Terima kasih telah berpartisipasi dalam pembelajaran green science! Setiap pengetahuan yang Anda peroleh 
              adalah langkah kecil menuju dunia yang lebih berkelanjutan. Terus belajar, terus berkarya untuk bumi yang lebih hijau.
            </p>
            
            <div className="flex justify-center items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2" style={{ color: currentColor }}>
                <MdEco />
                <span>Sustainable Learning</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: currentColor }}>
                <GiPlantSeed />
                <span>Green Future</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: currentColor }}>
                <GiEcology />
                <span>Eco Education</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HasilAkhir;