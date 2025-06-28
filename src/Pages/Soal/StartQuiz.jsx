import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaClock,
  FaQuestionCircle,
  FaCheckCircle,
  FaTimes,
  FaFlag,
  FaPlay,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaLightbulb,
  FaBookOpen,
  FaGraduationCap,
} from "react-icons/fa";
import { MdQuiz, MdScience } from "react-icons/md";
import { GiPlantSeed, GiEcology } from "react-icons/gi";
import { BsCheckLg } from "react-icons/bs";

const StartQuiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [siswaId, setSiswaId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentColor, currentMode } = useStateContext();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { groupId } = useParams();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === "Dark";

  // Format time for display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getProfileSiswa();
      getQuizData();
    } else {
      navigate("/login");
    }
  }, [navigate, groupId]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted) {
      handleSubmitQuiz();
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const getProfileSiswa = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/profile-siswa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSiswaId(response.data.data.id);
    } catch (error) {
      console.error("Error fetching siswa profile:", error);
      setError("Gagal memuat profil siswa");
    }
  };

  const getQuizData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/quiz/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { groupSoal, soals } = response.data.data;
      setQuizData(groupSoal);
      setQuestions(soals);
      setTimeLeft(groupSoal.durasi * 60); // Convert minutes to seconds
      setError("");
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      setError("Gagal memuat data kuis");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setShowInstructions(false);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setShowConfirmModal(false);

    try {
      console.log("Starting quiz submission...");
      console.log("Current answers:", userAnswers);
      console.log("Questions:", questions);
      console.log("Student ID:", siswaId);
      console.log("Group ID:", groupId);

      let score = 0;
      const totalQuestions = questions.length;

      // Calculate score and prepare detailed answers
      const detailedAnswers = questions.map((question) => {
        const userAnswer = userAnswers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) score++;

        console.log(`Question ${question.id}: User answer: ${userAnswer}, Correct: ${question.correctAnswer}, Is correct: ${isCorrect}`);

        return {
          soalId: question.id,
          jawaban: userAnswer || null,
          benar: isCorrect,
        };
      });

      const percentage = Math.round((score / totalQuestions) * 100);

      const quizResultData = {
        skor: percentage,
        jumlahJawabanBenar: score,
        siswaId: siswaId,
        groupSoalId: parseInt(groupId),
        detailedAnswers: detailedAnswers,
      };

      console.log("Quiz result data to submit:", quizResultData);

      // Validate data before sending
      if (!siswaId) {
        throw new Error("Student ID tidak tersedia");
      }
      if (!groupId) {
        throw new Error("Group ID tidak tersedia");
      }
      if (detailedAnswers.length === 0) {
        throw new Error("Tidak ada jawaban untuk disubmit");
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token tidak tersedia");
      }

      const apiUrl = process.env.REACT_APP_URL_API;
      console.log("Submitting to:", `${apiUrl}/quiz/submit`);

      const response = await axios.post(`${apiUrl}/quiz/submit`, quizResultData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Quiz submission response:", response.data);

      if (response.data.success) {
        navigate(`/hasil-quiz/${response.data.nilaiId}`);
      } else {
        throw new Error(response.data.message || "Gagal menyimpan hasil quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      console.error("Error response:", error.response?.data);
      
      let errorMessage = "Terjadi kesalahan saat menyimpan hasil quiz";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
      
      navigate("/hasil-quiz");
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / questions.length) * 100);
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
            Memuat Kuis
          </h3>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Menyiapkan soal untuk Anda...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <FaTimes className="text-6xl text-red-500 mx-auto mb-4" />
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
            Terjadi Kesalahan
          </h3>
          <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {error}
          </p>
          <button
            onClick={() => navigate("/quiz")}
            className="px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: currentColor }}
          >
            Kembali ke Daftar Kuis
          </button>
        </div>
      </div>
    );
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <div className="min-h-screen p-6">
        {/* Background Pattern */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-5">
            <GiEcology
              className="absolute top-20 left-10 text-8xl animate-pulse"
              style={{ color: currentColor }}
            />
            <FaLightbulb
              className="absolute top-40 right-20 text-6xl animate-bounce"
              style={{ color: currentColor, animationDelay: "1s" }}
            />
            <GiPlantSeed
              className="absolute bottom-40 left-20 text-7xl animate-pulse"
              style={{ color: currentColor, animationDelay: "0.5s" }}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `2px solid ${getColorWithOpacity(currentColor, 0.2)}`,
            }}
          >
            {/* Header */}
            <div
              className="p-8 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                <MdQuiz className="w-full h-full" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <FaBookOpen className="text-3xl" />
                  <div>
                    <h1 className="text-3xl font-bold">{quizData?.judul}</h1>
                    <p className="text-xl opacity-90">Instruksi Kuis Green Science</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-2xl" />
                    <div>
                      <p className="font-semibold">Durasi</p>
                      <p className="opacity-90">{quizData?.durasi} menit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaQuestionCircle className="text-2xl" />
                    <div>
                      <p className="font-semibold">Jumlah Soal</p>
                      <p className="opacity-90">{questions.length} pertanyaan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaGraduationCap className="text-2xl" />
                    <div>
                      <p className="font-semibold">Kelas</p>
                      <p className="opacity-90">{quizData?.kelas?.namaKelas || "Umum"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Left Column - Instructions */}
                <div>
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
                    Petunjuk Pengerjaan
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                      >
                        <FaClock style={{ color: currentColor }} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                          Waktu Pengerjaan
                        </h3>
                        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Anda memiliki waktu {quizData?.durasi} menit untuk menyelesaikan seluruh soal. 
                          Timer akan berjalan otomatis setelah kuis dimulai.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                      >
                        <FaCheckCircle style={{ color: currentColor }} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                          Cara Menjawab
                        </h3>
                        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Pilih satu jawaban yang paling tepat untuk setiap pertanyaan. 
                          Anda dapat mengubah jawaban sebelum mengirim hasil.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className="p-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                      >
                        <FaExclamationTriangle style={{ color: currentColor }} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                          Perhatian Penting
                        </h3>
                        <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Pastikan koneksi internet stabil. Jika waktu habis, jawaban akan 
                          otomatis terkirim. Kuis hanya dapat dikerjakan sekali.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Quiz Info */}
                <div>
                  <div
                    className="p-6 rounded-xl border-2"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                      Informasi Kuis
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Mata Pelajaran:
                        </span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                          Green Science
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Tingkat:
                        </span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                          {quizData?.kelas?.namaKelas || "Umum"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Jumlah Soal:
                        </span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                          {questions.length} soal
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Jenis Soal:
                        </span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                          Pilihan Ganda
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          Waktu:
                        </span>
                        <span className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}>
                          {quizData?.durasi} menit
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaLightbulb className="text-yellow-600 dark:text-yellow-400" />
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Tips Sukses
                      </h4>
                    </div>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Baca setiap pertanyaan dengan teliti</li>
                      <li>• Kelola waktu dengan bijak</li>
                      <li>• Jawab semua soal yang Anda yakini terlebih dahulu</li>
                      <li>• Periksa kembali jawaban sebelum mengirim</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="flex items-center gap-3 mx-auto px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                  }}
                >
                  <FaPlay />
                  Mulai Kuis Sekarang
                </motion.button>
                <p className={`mt-3 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Klik tombol di atas untuk memulai kuis
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <MdScience
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <GiPlantSeed
            className="absolute bottom-40 right-20 text-7xl animate-pulse"
            style={{ color: currentColor, animationDelay: "0.5s" }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header with Timer and Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div
            className="p-6 rounded-2xl shadow-lg border"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/quiz")}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaArrowLeft className={isDark ? "text-white" : "text-gray-800"} />
                </button>
                <div>
                  <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {quizData?.judul}
                  </h1>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {quizData?.kelas?.namaKelas}
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-500" : isDark ? "text-white" : "text-gray-800"}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Waktu Tersisa
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {currentQuestion + 1}/{questions.length}
                  </div>
                  <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Soal
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Progress: {getAnsweredCount()}/{questions.length} dijawab
                </span>
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: currentColor,
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="rounded-2xl shadow-lg border overflow-hidden"
          style={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: getColorWithOpacity(currentColor, 0.2),
          }}
        >
          {/* Question Header */}
          <div
            className="p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold">{currentQuestion + 1}</span>
              </div>
              <h3 className="text-lg font-semibold">
                Pertanyaan {currentQuestion + 1} dari {questions.length}
              </h3>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className={`text-lg leading-relaxed ${isDark ? "text-white" : "text-gray-800"}`}>
                {currentQuestionData?.soal}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {["A", "B", "C", "D", "E"].map((option) => {
                const optionText = currentQuestionData?.[`option${option}`];
                if (!optionText) return null;

                const isSelected = userAnswers[currentQuestionData?.id] === option;

                return (
                  <motion.div
                    key={option}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnswerSelect(currentQuestionData?.id, option)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? `border-transparent text-white`
                        : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${
                            isDark ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                          }`
                    }`}
                    style={isSelected ? {
                      background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : `${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`
                        }`}
                      >
                        {option}
                      </div>
                      <span className="flex-1">{optionText}</span>
                      {isSelected && <BsCheckLg className="text-white" />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentQuestion === 0
                    ? "opacity-50 cursor-not-allowed"
                    : `hover:bg-gray-100 dark:hover:bg-gray-700`
                } ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                <FaArrowLeft />
                Sebelumnya
              </button>

              <div className="flex items-center gap-3">
                {currentQuestion === questions.length - 1 ? (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                    }}
                  >
                    <FaFlag />
                    Selesai
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    style={{ color: currentColor }}
                  >
                    Selanjutnya
                    <FaArrowRight />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Question Navigator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderColor: getColorWithOpacity(currentColor, 0.2),
            }}
          >
            <h4 className={`text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Navigator Soal
            </h4>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentQuestion === index
                      ? "text-white"
                      : userAnswers[questions[index]?.id]
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : `${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"} hover:bg-gray-200 dark:hover:bg-gray-600`
                  }`}
                  style={currentQuestion === index ? { backgroundColor: currentColor } : {}}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full rounded-xl shadow-2xl p-6 ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 text-2xl" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                  Konfirmasi Pengiriman
                </h3>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Apakah Anda yakin ingin mengakhiri kuis? Anda telah menjawab{" "}
                  <span className="font-semibold">{getAnsweredCount()}</span> dari{" "}
                  <span className="font-semibold">{questions.length}</span> soal.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Batalkan
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  className="flex-1 py-3 px-4 rounded-lg text-white transition-all hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                  }}
                >
                  Ya, Kirim Jawaban
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StartQuiz;