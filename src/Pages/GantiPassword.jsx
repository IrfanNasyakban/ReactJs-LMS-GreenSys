import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";
import { 
  FaLeaf, 
  FaLock, 
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaRecycle,
  FaShieldAlt,
  FaKey,
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaTree,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSeedling
} from "react-icons/fa";
import { MdScience, MdEco, MdSecurity, MdVerifiedUser } from "react-icons/md";

const GantiPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confNewPassword, setConfNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // success, error, invalid
  
  // State untuk toggle visibility password
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  const { currentColor, currentMode } = useStateContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    if (strength <= 2) return { strength, label: "Lemah", color: "#ef4444" };
    if (strength <= 3) return { strength, label: "Sedang", color: "#f59e0b" };
    if (strength <= 4) return { strength, label: "Kuat", color: "#10b981" };
    return { strength, label: "Sangat Kuat", color: currentColor };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg("");
    setIsError(false);
    setIsSuccess(false);

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.patch(
        `${apiUrl}/change-password`,
        {
          oldPassword,
          newPassword,
          confNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOldPassword("");
      setNewPassword("");
      setConfNewPassword("");
      setIsSuccess(true);
      setMsg(response.data.msg);
      
      setModalType("success");
      setShowModal(true);
    } catch (error) {
      setIsError(true);
      const errorMessage = error.response?.data?.msg || "Terjadi kesalahan";
      setMsg(errorMessage);
      
      if (errorMessage.includes("Password lama tidak valid")) {
        setModalType("invalid");
      } else {
        setModalType("error");
      }
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  const handleErrorModalClose = () => {
    setShowModal(false);
  };

  // Security features data
  const securityFeatures = [
    {
      icon: <FaShieldAlt />,
      title: "Green Science Security",
      description: "Perlindungan data pembelajaran berkelanjutan"
    },
    {
      icon: <MdVerifiedUser />,
      title: "User Verification",
      description: "Verifikasi identitas untuk eco learning"
    },
    {
      icon: <FaUserShield />,
      title: "Privacy Protection",
      description: "Perlindungan privasi dalam green education"
    },
    {
      icon: <FaKey />,
      title: "Secure Access",
      description: "Akses aman ke platform green science"
    }
  ];

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaShieldAlt 
            className="absolute top-20 left-10 text-8xl animate-pulse" 
            style={{ color: currentColor }} 
          />
          <FaLock 
            className="absolute top-40 right-20 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1s' }} 
          />
          <FaUserShield 
            className="absolute bottom-40 left-20 text-7xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '0.5s' }} 
          />
          <MdSecurity 
            className="absolute bottom-20 right-10 text-8xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1.5s' }} 
          />
          <FaKey 
            className="absolute top-60 left-1/3 text-5xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '2s' }} 
          />
          <FaLeaf 
            className="absolute bottom-60 right-1/3 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '2.5s' }} 
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
                <FaLock className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Keamanan <span style={{ color: currentColor }}>Green Science</span>
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ubah password untuk mengamankan akses Green Science Learning System
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div 
            className="p-6 rounded-2xl shadow-lg backdrop-blur-sm border"
            style={{ 
              backgroundColor: getColorWithOpacity(currentColor, 0.05),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="p-2 rounded-full"
                style={{ backgroundColor: currentColor }}
              >
                <MdSecurity className="text-white text-xl" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Sistem Keamanan Green Science
                </h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Perlindungan berlapis untuk data pembelajaran berkelanjutan Anda
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group"
                >
                  <div 
                    className="p-4 rounded-xl border transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: getColorWithOpacity(currentColor, 0.08),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="p-2 rounded-full group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: currentColor }}
                      >
                        <span className="text-white">{feature.icon}</span>
                      </div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="rounded-2xl shadow-xl overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              {/* Form Header */}
              <div 
                className="py-6 px-8"
                style={{ 
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                }}
              >
                <div className="flex items-center gap-3">
                  <FaKey className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Form Ganti Password</h2>
                  <FaShieldAlt className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Password Lama Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaLock style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Verifikasi Identitas
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Password Lama
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        required
                        placeholder="Masukkan password lama untuk verifikasi"
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
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
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Masukkan password Anda saat ini untuk keamanan Green Science
                    </p>
                  </div>

                  {/* Password Baru Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaKey style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Password Baru
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Masukkan password baru yang kuat"
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
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
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Kekuatan Password:
                          </span>
                          <span 
                            className="text-sm font-medium" 
                            style={{ color: passwordStrength.color }}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: passwordStrength.color,
                              width: `${(passwordStrength.strength / 5) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <label className={`block text-sm font-medium mb-3 mt-5 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfPassword ? "text" : "password"}
                        required
                        placeholder="Konfirmasi password baru"
                        className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
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
                        value={confNewPassword}
                        onChange={(e) => setConfNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfPassword(!showConfPassword)}
                      >
                        {showConfPassword ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {confNewPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        {newPassword === confNewPassword ? (
                          <>
                            <FaCheckCircle className="text-green-500 text-sm" />
                            <span className="text-sm text-green-500">Password cocok</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="text-red-500 text-sm" />
                            <span className="text-sm text-red-500">Password tidak cocok</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-6 py-3 border rounded-xl text-sm font-medium transition-all duration-300 ${
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
                      disabled={isSubmitting || newPassword !== confNewPassword}
                      whileHover={{ scale: (isSubmitting || newPassword !== confNewPassword) ? 1 : 1.02 }}
                      whileTap={{ scale: (isSubmitting || newPassword !== confNewPassword) ? 1 : 0.98 }}
                      className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                        (isSubmitting || newPassword !== confNewPassword) ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      {isSubmitting ? "Memproses..." : "Ganti Password"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Security Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{ 
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
              }}
            >
              <div 
                className="p-4"
                style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
              >
                <div className="flex items-center gap-2">
                  <FaInfoCircle style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Tips Keamanan
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Gunakan minimal 8 karakter dengan kombinasi huruf besar, kecil, angka dan simbol
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Hindari menggunakan informasi personal seperti nama atau tanggal lahir
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Jangan gunakan password yang sama dengan akun lain
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Ganti password secara berkala untuk menjaga keamanan akun
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Green Science Security */}
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
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 p-2 rounded-full"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
                  >
                    <FaShieldAlt 
                      className="h-5 w-5" 
                      style={{ color: currentColor }}
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Keamanan Green Science
                    </h3>
                    <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Akun Anda melindungi data pembelajaran penting:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaRecycle style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Progress Pengolahan Limbah Organik
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdEco style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Data Green Economy Learning
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MdScience style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Skor Literasi Sains Berkelanjutan
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaSeedling style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Profil Green Learner/Educator
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User Info */}
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
              <div 
                className="p-4"
                style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}
              >
                <div className="flex items-center gap-2">
                  <FaUserShield style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Informasi Akun
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Username:
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.username || 'Green User'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Role:
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {user?.role === 'siswa' ? 'Green Learner' : 
                       user?.role === 'guru' ? 'Green Educator' : 
                       'System Admin'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: currentColor }}
                    >
                      🛡️ Akun Terverifikasi
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={modalType === "success" ? handleSuccessModalClose : handleErrorModalClose}
          ></div>
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl overflow-hidden z-10"
            style={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
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
                {modalType === "success" ? (
                  <FaCheckCircle className="h-6 w-6 text-white" />
                ) : modalType === "invalid" ? (
                  <FaExclamationTriangle className="h-6 w-6 text-white" />
                ) : (
                  <FaTimesCircle className="h-6 w-6 text-white" />
                )}
                <h3 className="text-lg font-bold text-white">
                  {modalType === "success" 
                    ? "Password Berhasil Diperbarui" 
                    : modalType === "invalid" 
                    ? "Password Lama Tidak Valid" 
                    : "Gagal Mengubah Password"}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div 
                  className={`p-3 rounded-full flex-shrink-0 ${
                    modalType === "success" 
                      ? isDark ? "bg-green-900/30" : "bg-green-100"
                      : modalType === "invalid" 
                      ? isDark ? "bg-yellow-900/30" : "bg-yellow-100"
                      : isDark ? "bg-red-900/30" : "bg-red-100"
                  }`}
                >
                  {modalType === "success" ? (
                    <FaCheckCircle className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  ) : modalType === "invalid" ? (
                    <FaExclamationTriangle className={`h-8 w-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  ) : (
                    <FaTimesCircle className={`h-8 w-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {modalType === "success" 
                      ? "Password Green Science Anda telah berhasil diperbarui. Silakan gunakan password baru untuk login selanjutnya." 
                      : msg}
                  </p>
                  
                  {modalType === "success" && (
                    <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}>
                      <div className="flex items-center gap-2">
                        <FaShieldAlt style={{ color: currentColor }} className="text-sm" />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Akun Green Science Anda sekarang lebih aman
                        </span>
                      </div>
                    </div>
                  )}
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
                onClick={modalType === "success" ? handleSuccessModalClose : handleErrorModalClose}
              >
                {modalType === "success" ? <FaCheckCircle /> : <FaTimes />}
                {modalType === "success" ? "Lanjutkan ke Dashboard" : "Tutup"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default GantiPassword;