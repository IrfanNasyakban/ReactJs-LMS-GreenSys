/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import { useStateContext } from "../../contexts/ContextProvider";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiBookOpen,
  FiCalendar,
  FiBook,
  FiUser,
  FiClock,
  FiAward,
  FiTarget,
} from "react-icons/fi";

const DetailNilai = () => {
  const [nilai, setNilai] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state) => state.auth);
  const { id } = useParams();
  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getNilaiById();
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  const getNilaiById = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/quiz-result/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNilai(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nilai detail:", error);
      setLoading(false);
    }
  };

  // Parse Quill JSON content to get text
  const parseQuillContent = (content) => {
    try {
      if (!content) return "Soal tidak tersedia";
      
      if (typeof content === 'string' && content.includes('{"ops":')) {
        const parsedContent = JSON.parse(content);
        
        if (parsedContent.ops) {
          return parsedContent.ops.map((op, index) => {
            if (typeof op.insert === 'string') {
              return <span key={index}>{op.insert}</span>;
            } else if (op.insert && op.insert.image) {
              return <img key={index} src={op.insert.image} alt={`Soal Image ${index}`} className="w-full max-w-[300px] my-2" />;
            }
            return null;
          });
        }
      }
      
      return content;
    } catch (error) {
      console.error("Error parsing Quill content:", error);
      return "Format soal tidak valid";
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

  const buttonStyle = {
    backgroundColor: currentColor,
  };

  const gradientStyle = {
    background:
      currentMode === "Dark"
        ? `linear-gradient(135deg, ${currentColor}20 0%, ${currentColor}40 100%)`
        : `linear-gradient(135deg, ${currentColor}10 0%, ${currentColor}30 100%)`,
  };

  const getOptionStyle = (option, correctAnswer, studentAnswer, isCorrect) => {
    if (option === correctAnswer) {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600";
    } else if (option === studentAnswer && !isCorrect) {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600";
    }
    return "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600";
  };

  const getOptionIcon = (option, correctAnswer, studentAnswer, isCorrect) => {
    if (option === correctAnswer) {
      return <FiCheckCircle className="text-green-500 text-lg" />;
    } else if (option === studentAnswer && !isCorrect) {
      return <FiXCircle className="text-red-500 text-lg" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: currentColor }}></div>
      </div>
    );
  }

  if (!nilai) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Data tidak ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Hasil ujian yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => navigate("/nilai")}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={buttonStyle}
          >
            Kembali ke Daftar Nilai
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-8 dark:bg-gray-900 mt-5">
        {/* Header section with gradient background */}
        <div className="rounded-xl p-6 mb-8" style={gradientStyle}>
          <div className="flex items-center mb-4">
            <button
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => navigate("/nilai")}
            >
              <FiArrowLeft className="mr-2 h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Detail Hasil Ujian
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
            Berikut adalah hasil detail ujian siswa dengan analisis jawaban per soal.
          </p>
        </div>

        {/* Student Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-2" style={{ backgroundColor: currentColor }}></div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Student Details */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  {nilai.siswa.url && (
                    <img
                      src={nilai.siswa.url}
                      alt={nilai.siswa.nama}
                      className="w-16 h-16 rounded-full object-cover mr-4 border-2"
                      style={{ borderColor: currentColor }}
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {nilai.siswa.nama}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      NIS: {nilai.siswa.nis}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiUser className="text-gray-500 dark:text-gray-400 mr-2 h-4 w-4" />
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Kelas
                      </h3>
                    </div>
                    <p className="text-base text-gray-800 dark:text-white font-medium">
                      {nilai.siswa.kelas.namaKelas} (Kelas {nilai.siswa.kelas.kelas})
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FiCalendar className="text-gray-500 dark:text-gray-400 mr-2 h-4 w-4" />
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Tanggal Ujian
                      </h3>
                    </div>
                    <p className="text-base text-gray-800 dark:text-white font-medium">
                      {formatDateTime(nilai.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FiBook className="text-gray-500 dark:text-gray-400 mr-2 h-4 w-4" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ujian
                    </h3>
                  </div>
                  <p className="text-base text-gray-800 dark:text-white font-medium">
                    {nilai.groupSoal.judul}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Modul: {nilai.groupSoal.modul.judul}
                  </p>
                </div>
              </div>

              {/* Right Column - Score and Stats */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Skor Akhir
                  </h3>
                  <div className="text-5xl font-bold mb-2" style={{ color: currentColor }}>
                    {parseFloat(nilai.skor).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    dari 100 poin
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className="rounded-full p-2"
                        style={{
                          backgroundColor: currentMode === "Dark" ? `${currentColor}40` : `${currentColor}20`,
                        }}
                      >
                        <FiTarget className="text-lg" style={{ color: currentColor }} />
                      </div>
                    </div>
                    <h3 className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Jawaban Benar
                    </h3>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {nilai.jumlahJawabanBenar}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div
                        className="rounded-full p-2"
                        style={{
                          backgroundColor: currentMode === "Dark" ? `${currentColor}40` : `${currentColor}20`,
                        }}
                      >
                        <FiBookOpen className="text-lg" style={{ color: currentColor }} />
                      </div>
                    </div>
                    <h3 className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Total Soal
                    </h3>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {nilai.jumlahSoal}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-center">
                    <FiClock className="mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Durasi: {nilai.groupSoal.durasi} menit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Answers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Detail Jawaban Per Soal
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Analisis jawaban siswa untuk setiap soal dalam ujian ini
            </p>
          </div>

          {/* Questions List */}
          <div className="p-6 space-y-6">
            {nilai.nilai_soals.map((item, index) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Question Header */}
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3"
                      style={buttonStyle}
                    >
                      {index + 1}
                    </div>
                    <span className="text-lg font-medium text-gray-800 dark:text-white">
                      Soal {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {item.benar ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <FiCheckCircle className="mr-1" />
                        Benar
                      </div>
                    ) : (
                      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <FiXCircle className="mr-1" />
                        Salah
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-4">
                  {/* Question Text */}
                  <div className="mb-4">
                    <div className="text-gray-800 dark:text-white text-base leading-relaxed">
                      {parseQuillContent(item.soal.soal)}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {/* Option A */}
                    <div className={`p-3 rounded-lg border-2 flex items-center ${getOptionStyle('A', item.soal.correctAnswer, item.jawaban, item.benar)}`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mr-3 font-medium">
                        A
                      </div>
                      <div className="flex-1">
                        {item.soal.optionA}
                      </div>
                      {getOptionIcon('A', item.soal.correctAnswer, item.jawaban, item.benar)}
                    </div>

                    {/* Option B */}
                    <div className={`p-3 rounded-lg border-2 flex items-center ${getOptionStyle('B', item.soal.correctAnswer, item.jawaban, item.benar)}`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mr-3 font-medium">
                        B
                      </div>
                      <div className="flex-1">
                        {item.soal.optionB}
                      </div>
                      {getOptionIcon('B', item.soal.correctAnswer, item.jawaban, item.benar)}
                    </div>

                    {/* Option C */}
                    <div className={`p-3 rounded-lg border-2 flex items-center ${getOptionStyle('C', item.soal.correctAnswer, item.jawaban, item.benar)}`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mr-3 font-medium">
                        C
                      </div>
                      <div className="flex-1">
                        {item.soal.optionC}
                      </div>
                      {getOptionIcon('C', item.soal.correctAnswer, item.jawaban, item.benar)}
                    </div>

                    {/* Option D */}
                    <div className={`p-3 rounded-lg border-2 flex items-center ${getOptionStyle('D', item.soal.correctAnswer, item.jawaban, item.benar)}`}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mr-3 font-medium">
                        D
                      </div>
                      <div className="flex-1">
                        {item.soal.optionD}
                      </div>
                      {getOptionIcon('D', item.soal.correctAnswer, item.jawaban, item.benar)}
                    </div>

                    {/* Option E (if exists) */}
                    {item.soal.optionE && (
                      <div className={`p-3 rounded-lg border-2 flex items-center ${getOptionStyle('E', item.soal.correctAnswer, item.jawaban, item.benar)}`}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 mr-3 font-medium">
                          E
                        </div>
                        <div className="flex-1">
                          {item.soal.optionE}
                        </div>
                        {getOptionIcon('E', item.soal.correctAnswer, item.jawaban, item.benar)}
                      </div>
                    )}
                  </div>

                  {/* Answer Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Jawaban anda: </span>
                          <span className={`font-semibold ${item.benar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {item.jawaban}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Jawaban benar: </span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {item.soal.correctAnswer}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div
                className="rounded-full p-3 mr-4"
                style={{
                  backgroundColor: currentMode === "Dark" ? `${currentColor}40` : `${currentColor}20`,
                }}
              >
                <FiCheckCircle className="text-xl" style={{ color: currentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {nilai.jumlahJawabanBenar}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Jawaban Benar</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div
                className="rounded-full p-3 mr-4"
                style={{
                  backgroundColor: currentMode === "Dark" ? `#ef444440` : `#ef444420`,
                }}
              >
                <FiXCircle className="text-xl text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {nilai.jumlahSoal - nilai.jumlahJawabanBenar}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Jawaban Salah</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div
                className="rounded-full p-3 mr-4"
                style={{
                  backgroundColor: currentMode === "Dark" ? `${currentColor}40` : `${currentColor}20`,
                }}
              >
                <FiAward className="text-xl" style={{ color: currentColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {((nilai.jumlahJawabanBenar / nilai.jumlahSoal) * 100).toFixed(1)}%
                </p>
                <p className="text-gray-600 dark:text-gray-400">Persentase Benar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailNilai;