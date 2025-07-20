import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaChevronRight,
  FaPhone,
  FaVenusMars,
  FaEdit,
  FaCamera,
  FaSave,
  FaTimes,
  FaChalkboardTeacher,
  FaUserEdit,
  FaLightbulb,
  FaLeaf,
  FaBook,
  FaUsers,
} from "react-icons/fa";
import {
  MdLibraryBooks,
  MdPerson,
  MdEmail,
  MdLocationOn,
  MdCake,
} from "react-icons/md";
import { BsPersonBadge } from "react-icons/bs";

const EditDataGuru = () => {
  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [gender, setGender] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);
  const { currentColor, currentMode } = useStateContext();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const isDark = currentMode === 'Dark';
  const isOwnProfile = user && user.role === "guru";

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Format date for input
  const formatDateForInput = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "G";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getGuruById();
    } else {
      navigate("/login");
    }
  }, [navigate, id]);

  const getGuruById = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/guru/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = response.data;
      setNip(data.nip || "");
      setNama(data.nama || "");
      setEmail(data.email || "");
      setNoHp(data.noHp || "");
      setGender(data.gender || "");
      setTanggalLahir(formatDateForInput(data.tanggalLahir) || "");
      setAlamat(data.alamat || "");
      setPreview(data.url || null);
    } catch (error) {
      console.error("Error fetching guru data:", error);
      setError("Gagal memuat data guru");
    } finally {
      setLoading(false);
    }
  };

  const updateGuru = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!nama.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }
    if (!email.trim()) {
      setError("Email tidak boleh kosong");
      return;
    }

    const formData = new FormData();
    formData.append("nip", nip);
    formData.append("nama", nama);
    formData.append("email", email);
    formData.append("noHp", noHp);
    formData.append("gender", gender);
    formData.append("tanggalLahir", tanggalLahir);
    formData.append("alamat", alamat);
    if (file) {
      formData.append("file", file);
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.patch(`${apiUrl}/guru/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      setSuccess("Data guru berhasil diperbarui!");
      
      setTimeout(() => {
        if (user && user.role === "guru") {
          navigate("/profile-saya");
        } else if (user && user.role === "admin") {
          navigate("/guru");
        }
      }, 1500);
    } catch (error) {
      console.error("Error updating guru:", error);
      if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else {
        setError("Gagal memperbarui data guru");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadImage = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      
      if (selectedFile.size > maxSize) {
        setError("Ukuran gambar harus kurang dari 5 MB");
        return;
      }
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Format file harus PNG, JPG, atau JPEG");
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setError(""); // Clear any previous errors
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeMessage = () => {
    setError("");
    setSuccess("");
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
            style={{ borderColor: `${currentColor} transparent ${currentColor} ${currentColor}` }}
          />
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Memuat data guru...
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
          <FaChalkboardTeacher 
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

      {/* Floating Notification */}
      {(error || success) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div
            className={`p-4 rounded-xl shadow-xl border ${
              error
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-1 rounded-full ${
                    error ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {error ? (
                    <FaTimes className="text-red-600 text-sm" />
                  ) : (
                    <FaSave className="text-green-600 text-sm" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {error ? "Error!" : "Berhasil!"}
                  </p>
                  <p className="text-xs mt-1">{error || success}</p>
                </div>
              </div>
              <button
                onClick={closeMessage}
                className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${
                  error
                    ? "hover:bg-red-600 text-red-600"
                    : "hover:bg-green-600 text-green-600"
                }`}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
              onClick={() => navigate(isOwnProfile ? "/profile-saya" : "/guru")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <FaArrowLeft />
              {isOwnProfile ? "Profil Saya" : "Data Guru"}
            </button>
            <FaChevronRight
              className={isDark ? "text-gray-500" : "text-gray-400"}
            />
            <span style={{ color: currentColor }} className="font-medium">
              {isOwnProfile ? "Edit Profil" : "Edit Data Guru"}
            </span>
          </div>
        </motion.div>

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
                <FaUserEdit className="text-white text-2xl" />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {isOwnProfile ? "Edit " : "Edit Data "}
                  <span style={{ color: currentColor }}>
                    {isOwnProfile ? "Profil" : "Guru"}
                  </span>
                </h1>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  GreenSys - Green Science Learning Management System
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Preview Card */}
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
              <div
                className="py-6 px-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                }}
              >
                <div className="relative inline-block">
                  {preview && preview !== "http://localhost:5000/images/null" && preview !== `${process.env.REACT_APP_URL_API}/images/null` ? (
                    <img
                      src={preview}
                      alt="Preview"
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
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <FaCamera className="text-gray-600 text-sm" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mt-4">
                  {nama || 'Nama Guru'}
                </h3>
                <p className="text-white opacity-90 text-sm">
                  NIP: {nip || 'Belum diisi'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                    <span className="text-white text-xs font-medium">Guru</span>
                  </div>
                  <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                    <span className="text-white text-xs font-medium">Green Science</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Preview Data
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Email:</span>
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {email || 'Belum diisi'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Gender:</span>
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {gender === 'Laki-laki' ? 'Laki-laki' : gender === 'Perempuan' ? 'Perempuan' : 'Belum dipilih'}
                        </span>
                      </div>
                      {tanggalLahir && (
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Lahir:</span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {new Date(tanggalLahir).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats for Guru */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div
                        className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center"
                        style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                      >
                        <FaBook style={{ color: currentColor }} className="text-sm" />
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        5
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Modul
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center"
                        style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                      >
                        <FaUsers style={{ color: currentColor }} className="text-sm" />
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        25
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Siswa
                      </p>
                    </div>
                  </div>

                  {file && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                        Foto Baru:
                      </p>
                      <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {file.name}
                      </p>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
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
                className="py-6 px-8"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <FaEdit className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">
                    Form {isOwnProfile ? "Edit Profil" : "Edit Data Guru"}
                  </h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={updateGuru} className="space-y-6">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={loadImage}
                    className="hidden"
                  />

                  {/* NIP & Nama */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BsPersonBadge style={{ color: currentColor }} />
                        <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          NIP (Nomor Induk Pegawai)
                        </label>
                      </div>
                      <input
                        type="text"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        placeholder="Masukkan NIP"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                      />
                    </div>

                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <MdPerson style={{ color: currentColor }} />
                        <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Nama Lengkap *
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Email dan No Hp */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <MdEmail style={{ color: currentColor }} />
                        <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Email *
                        </label>
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                      />
                    </div>

                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FaPhone style={{ color: currentColor }} />
                        <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          No Hp/WhatsApp
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        placeholder="Masukkan nomor hp/WhatsApp"
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Gender & Tanggal Lahir */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FaVenusMars style={{ color: currentColor }} />
                        <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Jenis Kelamin
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          gender === 'Laki-laki' 
                            ? `border-transparent text-white` 
                            : isDark 
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                        style={gender === 'Laki-laki' ? {
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                        } : {}}>
                          <input
                            type="radio"
                            name="gender"
                            value="Laki-laki"
                            checked={gender === 'Laki-laki'}
                            onChange={(e) => setGender(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-sm font-medium">Laki-laki</span>
                        </label>
                        <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          gender === 'Perempuan' 
                            ? `border-transparent text-white` 
                            : isDark 
                              ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                        style={gender === 'Perempuan' ? {
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                        } : {}}>
                          <input
                            type="radio"
                            name="gender"
                            value="Perempuan"
                            checked={gender === 'Perempuan'}
                            onChange={(e) => setGender(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-sm font-medium">Perempuan</span>
                        </label>
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.05),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <MdCake style={{ color: currentColor }} />
                        <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Tanggal Lahir
                        </label>
                      </div>
                      <input
                        type="date"
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Alamat */}
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2),
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MdLocationOn style={{ color: currentColor }} />
                      <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Alamat
                      </label>
                    </div>
                    <textarea
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none resize-none ${
                        isDark
                          ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                          : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                      }`}
                      style={{
                        borderColor: getColorWithOpacity(currentColor, 0.3),
                        boxShadow: `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = currentColor;
                        e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                        e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate(isOwnProfile ? "/profile-saya" : "/guru")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-6 py-3 border rounded-xl text-sm font-medium transition-all duration-300 ${
                        isDark
                          ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <FaTimes />
                      Batal
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                        isSubmitting
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:shadow-xl"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                          currentColor,
                          0.8
                        )} 100%)`,
                      }}
                    >
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDataGuru;