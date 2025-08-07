import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";

import { 
  FaGraduationCap, 
  FaUserEdit, 
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaIdCard,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCamera,
  FaLeaf,
  FaRecycle,
  FaCheckCircle,
  FaTimesCircle,
  FaBook,
  FaPencilAlt,
  FaSchool,
  FaPhone
} from "react-icons/fa";
import { MdScience, MdEco } from "react-icons/md";
import { BsDoorOpen } from "react-icons/bs";

const AddProfileSiswa = () => {
  const [kelasList, setKelasList] = useState([]);
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [gender, setGender] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getKelas();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const getKelas = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/all-kelas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKelasList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const saveSiswa = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("nis", nis);
    formData.append("nama", nama);
    formData.append("email", email);
    formData.append("noHp", noHp);
    formData.append("kelasId", kelasId);
    formData.append("gender", gender);
    formData.append("tanggalLahir", tanggalLahir);
    formData.append("alamat", alamat);

    if (file) {
      formData.append("file", file);
    }

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.post(
        `${apiUrl}/siswa`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setIsSubmitting(false);
    }
  };

  const loadImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form validation
  const isFormValid = nis && nama && email && kelasId && gender && tanggalLahir && alamat;

  return (
    <div className="p-3 sm:p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaSchool 
            className="absolute top-40 right-20 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1s' }} 
          />
          <MdScience 
            className="absolute top-60 left-1/3 text-5xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '2s' }} 
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
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
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            {/* Mobile Layout */}
            <div className="sm:hidden">
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentColor }}
                >
                  <FaGraduationCap className="text-white text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Profil <span style={{ color: currentColor }}>Green Learner</span>
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    Lengkapi profil Anda sebagai Green Learner
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center gap-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <FaGraduationCap className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Profil <span style={{ color: currentColor }}>Green Learner</span>
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Lengkapi profil Anda sebagai pembelajar dalam Green Science Learning System
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              {/* Form Header */}
              <div 
                className="py-4 sm:py-6 px-4 sm:px-8"
                style={{ 
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaUserEdit className="text-white text-lg sm:text-xl" />
                  <h2 className="text-base sm:text-xl font-bold text-white">Form Profil Green Learner</h2>
                  <FaLeaf className="text-white text-sm sm:text-lg animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-4 sm:p-8">
                <form onSubmit={saveSiswa} className="space-y-6 sm:space-y-8">
                  {/* Student Identity Section */}
                  <div 
                    className="p-4 sm:p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <FaIdCard style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Identitas Learner
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* NIS */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Nomor Induk Siswa (NIS)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="nis"
                            required
                            placeholder="Masukkan NIS Anda"
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaIdCard style={{ color: currentColor }} className="animate-pulse text-sm" />
                          </div>
                        </div>
                        <p className={`mt-1 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          NIS resmi sebagai siswa SMA 1 Lhokseumawe
                        </p>
                      </div>

                      {/* Nama Lengkap */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Nama Lengkap
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="nama"
                            required
                            placeholder="Nama lengkap sesuai dokumen resmi"
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaUser style={{ color: currentColor }} className="animate-pulse text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="nama@sma1lhk.sch.id atau email pribadi"
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaEnvelope style={{ color: currentColor }} className="animate-pulse text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Kelas */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Eco Classroom
                        </label>
                        <div className="relative">
                          <select
                            name="kelasId"
                            required
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-white text-gray-900 border-gray-300'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={kelasId}
                            onChange={(e) => setKelasId(e.target.value)}
                          >
                            <option value="">Pilih Eco Classroom Anda</option>
                            {kelasList.map((kelas) => (
                              <option key={kelas.id} value={kelas.id}>
                                {kelas.namaKelas}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <BsDoorOpen style={{ color: currentColor }} className="text-sm" />
                          </div>
                        </div>
                        <p className={`mt-1 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Pilih kelas Green Science tempat Anda belajar
                        </p>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Jenis Kelamin
                        </label>
                        <div className="flex items-center space-x-4 sm:space-x-6">
                          <div className="flex items-center">
                            <input
                              id="laki-laki-siswa"
                              name="gender"
                              type="radio"
                              value="Laki-laki"
                              checked={gender === "Laki-laki"}
                              onChange={(e) => setGender(e.target.value)}
                              className="h-4 w-4 border-gray-300"
                              style={{ accentColor: currentColor }}
                            />
                            <label htmlFor="laki-laki-siswa" className={`ml-2 block text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              Laki-laki
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="perempuan-siswa"
                              name="gender"
                              type="radio"
                              value="Perempuan"
                              checked={gender === "Perempuan"}
                              onChange={(e) => setGender(e.target.value)}
                              className="h-4 w-4 border-gray-300"
                              style={{ accentColor: currentColor }}
                            />
                            <label htmlFor="perempuan-siswa" className={`ml-2 block text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              Perempuan
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Tanggal Lahir */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Tanggal Lahir
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="tanggalLahir"
                            required
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-white text-gray-900 border-gray-300'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={tanggalLahir}
                            onChange={(e) => setTanggalLahir(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaCalendarAlt style={{ color: currentColor }} className="text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Alamat */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Alamat Lengkap
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="alamat"
                            required
                            placeholder="Alamat lengkap tempat tinggal"
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaMapMarkerAlt style={{ color: currentColor }} className="animate-pulse text-sm" />
                          </div>
                        </div>
                      </div>

                      {/* No Hp */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 sm:mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Nomor HP
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            name="noHp"
                            required
                            placeholder="Nomor HP aktif"
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                            }`}
                            style={{
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = currentColor;
                              e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                              e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                            }}
                            value={noHp}
                            onChange={(e) => setNoHp(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaPhone style={{ color: currentColor }} className="animate-pulse text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div 
                    className="p-4 sm:p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <FaCamera style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Foto Profil Green Learner
                      </h3>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="relative">
                          <input
                            type="file"
                            name="file"
                            id="file"
                            accept="image/*"
                            onChange={loadImage}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="py-2.5 sm:py-3 px-4 sm:px-6 border rounded-lg sm:rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: getColorWithOpacity(currentColor, 0.1),
                              borderColor: getColorWithOpacity(currentColor, 0.3),
                              color: currentColor
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <FaCamera />
                              <span className="hidden sm:inline">Pilih Foto Profil</span>
                              <span className="sm:hidden">Pilih Foto</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {file ? file.name : "Belum ada foto yang dipilih"}
                        </span>
                      </div>

                      {/* Image Preview */}
                      {preview && (
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          <div className="relative mx-auto sm:mx-0">
                            <div
                              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2"
                              style={{ borderColor: currentColor }}
                            >
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFile(null);
                                setPreview(null);
                              }}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
                            >
                              <FaTimesCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <div className="text-center sm:text-left">
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              Preview Foto Profil
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Foto ini akan ditampilkan di profil Green Learner Anda
                            </p>
                          </div>
                        </div>
                      )}

                      <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Upload foto profil yang jelas dan sopan (JPG, PNG, maksimal 5MB)
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border rounded-lg sm:rounded-xl text-sm font-medium transition-all duration-300 ${
                        isDark 
                          ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <FaTimes />
                      Batal
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !isFormValid}
                      whileHover={{ scale: (isSubmitting || !isFormValid) ? 1 : 1.02 }}
                      whileTap={{ scale: (isSubmitting || !isFormValid) ? 1 : 0.98 }}
                      className={`flex items-center justify-center gap-2 px-4 sm:px-8 py-3 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                        (isSubmitting || !isFormValid) ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      <span className="hidden sm:inline">
                        {isSubmitting ? "Menyimpan Profil..." : "Simpan Profil Green Learner"}
                      </span>
                      <span className="sm:hidden">
                        {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">

            {/* Green Learner Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div 
                    className="flex-shrink-0 p-2 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaInfoCircle 
                      className="h-4 w-4 sm:h-5 sm:w-5" 
                      style={{ color: currentColor }}
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm sm:text-base mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Akses Green Learner
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Setelah melengkapi profil, Anda akan mendapat akses ke:
                    </p>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-2">
                        <FaBook style={{ color: currentColor }} className="text-xs sm:text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Materi Green Science Learning
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPencilAlt style={{ color: currentColor }} className="text-xs sm:text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Quiz & Assessment Eco-Learning
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRecycle style={{ color: currentColor }} className="text-xs sm:text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Praktik Pengolahan Limbah Organik
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdEco style={{ color: currentColor }} className="text-xs sm:text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Green Economy Learning Path
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <FaLeaf style={{ color: currentColor }} />
                  <h3 className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Tips Green Learner
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <FaCheckCircle style={{ color: currentColor }} className="text-xs sm:text-sm mt-1 flex-shrink-0" />
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Gunakan foto profil yang jelas dan sopan
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle style={{ color: currentColor }} className="text-xs sm:text-sm mt-1 flex-shrink-0" />
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Pastikan data yang diisi sesuai dengan dokumen resmi
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle style={{ color: currentColor }} className="text-xs sm:text-sm mt-1 flex-shrink-0" />
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Pilih kelas yang sesuai dengan kelas Anda saat ini
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle style={{ color: currentColor }} className="text-xs sm:text-sm mt-1 flex-shrink-0" />
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Email akan digunakan untuk notifikasi pembelajaran
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProfileSiswa;