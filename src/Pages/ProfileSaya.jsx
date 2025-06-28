import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaUser,
  FaIdCard,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaSchool,
  FaEdit,
  FaCamera,
  FaCalendarAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserCircle,
  FaLeaf,
  FaSeedling,
  FaRecycle,
  FaLightbulb,
  FaBook,
  FaAward,
  FaClock,
  FaEye,
} from "react-icons/fa";
import {
  MdLibraryBooks,
  MdDescription,
  MdSchool,
  MdPerson,
  MdEmail,
  MdLocationOn,
  MdCake,
} from "react-icons/md";
import { BsPersonBadge, BsCalendar3 } from "react-icons/bs";

const ProfileSaya = () => {
  const [siswaId, setSiswaId] = useState("");
  const [guruId, setGuruId] = useState("");
  const [nis, setNis] = useState("");
  const [nip, setNip] = useState("");
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kelas, setKelas] = useState("");
  const [gender, setGender] = useState("");
  const [umur, setUmur] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentColor, currentMode } = useStateContext();

  const isDark = currentMode === 'Dark';

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      if (user && user.role === "guru") {
        getProfileGuru();
      } else if (user && user.role === "siswa") {
        getProfileSiswa();
      }
    } else {
      navigate("/login");
    }
  }, [navigate, user]);

  const formatDateForDisplay = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getProfileSiswa = async () => {
    setIsLoading(true);
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
        setNis(profileData.nis);
        setNama(profileData.nama);
        setEmail(profileData.email);
        setKelas(profileData.kelas.kelas);
        setGender(profileData.gender);
        setTanggalLahir(profileData.tanggalLahir);
        setAlamat(profileData.alamat);
        setPreview(profileData.url);

        // Mengakses username dari nested object 'user'
        if (profileData.user) {
          setUsername(profileData.user.username);
        }
      } else {
        console.error("Format data tidak sesuai:", response.data);
      }
    } catch (error) {
      console.error("Error mengambil profile siswa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileGuru = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/profile-guru`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setGuruId(profileData.id);
        setNip(profileData.nip);
        setNama(profileData.nama);
        setEmail(profileData.email);
        setGender(profileData.gender);
        setTanggalLahir(profileData.tanggalLahir);
        setAlamat(profileData.alamat);
        setPreview(profileData.url);

        if (profileData.user) {
          setUsername(profileData.user.username);
        }
      } else {
        console.error("Format data tidak sesuai:", response.data);
      }
    } catch (error) {
      console.error("Error mengambil profile guru:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mendapatkan inisial dari nama untuk avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${currentColor} transparent ${currentColor} ${currentColor}` }}
          />
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Memuat profil...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <FaUser 
            className="absolute top-20 left-10 text-8xl animate-pulse" 
            style={{ color: currentColor }} 
          />
          <FaLightbulb 
            className="absolute top-40 right-20 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1s' }} 
          />
          <MdLibraryBooks 
            className="absolute bottom-40 left-20 text-7xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '0.5s' }} 
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
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                {user?.role === 'siswa' ? (
                  <FaGraduationCap className="text-white text-2xl" />
                ) : (
                  <FaChalkboardTeacher className="text-white text-2xl" />
                )}
              </div>
              <div className="flex-1">
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  Profil <span style={{ color: currentColor }}>Saya</span>
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  GreenSys - Green Science Learning Management System
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(user?.role === 'siswa' ? `/siswa/${siswaId}` : `/guru/${guruId}`)}
                  className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                  }}
                >
                  <FaEdit />
                  Edit Profil
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl shadow-xl overflow-hidden sticky top-6"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              {/* Profile Header */}
              <div
                className="py-8 px-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                }}
              >
                <div className="relative inline-block">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold"
                      style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
                    >
                      <span className="text-white">{getInitials(nama)}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <FaCamera className="text-gray-600 text-sm" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mt-4">{nama || 'Nama Belum Diisi'}</h3>
                <p className="text-white opacity-90 text-sm">@{username}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                    <span className="text-white text-xs font-medium">
                      {user?.role === 'siswa' ? 'Siswa' : 'Guru'}
                    </span>
                  </div>
                  {user?.role === 'siswa' && kelas && (
                    <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                      <span className="text-white text-xs font-medium">{kelas}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                    >
                      <FaBook style={{ color: currentColor }} />
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? '12' : '5'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.role === 'siswa' ? 'Modul Selesai' : 'Modul Dibuat'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                    >
                      <FaAward style={{ color: currentColor }} />
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? '8' : '25'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.role === 'siswa' ? 'Sertifikat' : 'Siswa Aktif'}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/modul-belajar')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <FaBook style={{ color: currentColor }} />
                    <span className="font-medium">Lihat Modul Belajar</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <FaAward style={{ color: currentColor }} />
                    <span className="font-medium">
                      {user?.role === 'siswa' ? 'Sertifikat Saya' : 'Kelola Siswa'}
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
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
                  <MdPerson style={{ color: currentColor }} />
                  <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                    Informasi Personal
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUserCircle className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Username
                      </label>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {username || 'Belum diisi'}
                    </p>
                  </div>

                  {/* NIS/NIP */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BsPersonBadge className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user?.role === 'siswa' ? 'NIS' : 'NIP'}
                      </label>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? (nis || 'Belum diisi') : (nip || 'Belum diisi')}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MdEmail className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {email || 'Belum diisi'}
                    </p>
                  </div>

                  {/* Kelas (hanya untuk siswa) */}
                  {user?.role === 'siswa' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MdSchool className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Kelas
                        </label>
                      </div>
                      <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {kelas || 'Belum diisi'}
                      </p>
                    </div>
                  )}

                  {/* Gender */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaVenusMars className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Jenis Kelamin
                      </label>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {gender === 'L' ? 'Laki-laki' : gender === 'P' ? 'Perempuan' : 'Belum diisi'}
                    </p>
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MdCake className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Tanggal Lahir
                      </label>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {formatDateForDisplay(tanggalLahir) || 'Belum diisi'}
                      {tanggalLahir && (
                        <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({calculateAge(tanggalLahir)} tahun)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Alamat */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MdLocationOn className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Alamat
                    </label>
                  </div>
                  <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {alamat || 'Belum diisi'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Green Science Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
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
                  <FaLeaf style={{ color: currentColor }} />
                  <h3 className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                    Pencapaian Green Science
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaSeedling className="text-3xl mx-auto mb-2" style={{ color: currentColor }} />
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? '15' : '45'}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.role === 'siswa' ? 'Proyek Selesai' : 'Proyek Dibimbing'}
                    </p>
                  </div>
                  
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaRecycle className="text-3xl mx-auto mb-2" style={{ color: currentColor }} />
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? '8' : '120'}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.role === 'siswa' ? 'Kontribusi Hijau' : 'Impact Points'}
                    </p>
                  </div>
                  
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaLightbulb className="text-3xl mx-auto mb-2" style={{ color: currentColor }} />
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? '3' : '12'}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.role === 'siswa' ? 'Inovasi Hijau' : 'Workshop'}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6">
                  <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Aktivitas Terbaru
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaLeaf className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          {user?.role === 'siswa' 
                            ? 'Menyelesaikan modul "Energi Terbarukan"' 
                            : 'Membuat modul baru "Teknologi Hijau"'
                          }
                        </p>
                        <p className="text-xs text-green-600">2 jam yang lalu</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaBook className="text-blue-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          {user?.role === 'siswa' 
                            ? 'Mengikuti kuis "Sustainable Living"' 
                            : 'Mengoreksi tugas kelas XII IPA'
                          }
                        </p>
                        <p className="text-xs text-blue-600">1 hari yang lalu</p>
                      </div>
                    </div>
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

export default ProfileSaya;