import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";
import { useStateContext } from "../contexts/ContextProvider";
import { motion } from "framer-motion";

import { 
  FaUsers, 
  FaUserPlus, 
  FaInfoCircle, 
  FaSave, 
  FaTimes,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaLeaf,
  FaRecycle,
  FaSeedling,
  FaCheckCircle,
  FaTimesCircle,
  FaKey,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import { MdEco, MdAdminPanelSettings, MdVerifiedUser, MdGroup } from "react-icons/md";

const AddUsers = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

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

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    const checks = {
      length: password.length >= 6,
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

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const saveUsers = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confPassword", confPassword);
    formData.append("role", role);

    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.post(`${apiUrl}/users`, jsonData);
      navigate("/users");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;

    if (value.includes(" ")) {
      setUsernameError("Username tidak boleh mengandung spasi");
    } else {
      setUsernameError("");
    }

    const noSpacesValue = value.replace(/\s+/g, "");
    setUsername(noSpacesValue);
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'siswa': return 'Green Learner';
      case 'guru': return 'Green Educator';
      case 'admin': return 'System Admin';
      default: return '';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'siswa': return <FaGraduationCap />;
      case 'guru': return <FaChalkboardTeacher />;
      case 'admin': return <MdAdminPanelSettings />;
      default: return <FaUsers />;
    }
  };

  const getRoleDescription = (role) => {
    switch(role) {
      case 'siswa': return 'Akses penuh ke materi pembelajaran, quiz, dan progress tracking Green Science';
      case 'guru': return 'Dapat mengelola kelas, siswa, materi, dan evaluasi dalam Green Science Learning';
      case 'admin': return 'Kontrol penuh sistem, manajemen user, dan konfigurasi Green Science System';
      default: return '';
    }
  };

  // Form validation
  const isFormValid = username && email && password && confPassword && role && 
                     !usernameError && password === confPassword;

  return (
    <div className="p-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-3">
          <FaUserPlus 
            className="absolute top-20 left-10 text-8xl animate-pulse" 
            style={{ color: currentColor }} 
          />
          <MdGroup 
            className="absolute top-40 right-20 text-6xl animate-bounce" 
            style={{ color: currentColor, animationDelay: '1s' }} 
          />
          <FaUserShield 
            className="absolute bottom-40 left-20 text-7xl animate-pulse" 
            style={{ color: currentColor, animationDelay: '0.5s' }} 
          />
          <MdVerifiedUser 
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
                <FaUserPlus className="text-white text-2xl" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Tambah <span style={{ color: currentColor }}>Green Community</span> Member
                </h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Daftarkan anggota baru ke Green Science Learning Management System
                </p>
              </div>
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
                  <FaUsers className="text-white text-xl" />
                  <h2 className="text-xl font-bold text-white">Form Registrasi Green Community</h2>
                  <FaLeaf className="text-white text-lg animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={saveUsers} className="space-y-8">
                  {/* User Identity Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaUser style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Identitas Pengguna
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Username */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Username Green Science
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="username"
                            required
                            placeholder="Masukkan username unik (tanpa spasi)"
                            className={`block w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none ${
                              usernameError 
                                ? 'border-red-500' 
                                : isDark 
                                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                                : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                            }`}
                            style={{
                              borderColor: usernameError ? '#ef4444' : getColorWithOpacity(currentColor, 0.3),
                              boxShadow: usernameError ? '0 0 0 1px #ef4444' : `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`
                            }}
                            onFocus={(e) => {
                              if (!usernameError) {
                                e.target.style.borderColor = currentColor;
                                e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(currentColor, 0.1)}`;
                              }
                            }}
                            onBlur={(e) => {
                              if (!usernameError) {
                                e.target.style.borderColor = getColorWithOpacity(currentColor, 0.3);
                                e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(currentColor, 0.1)}`;
                              }
                            }}
                            value={username}
                            onChange={handleUsernameChange}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {usernameError ? (
                              <FaTimesCircle className="text-red-500" />
                            ) : username ? (
                              <FaCheckCircle className="text-green-500" />
                            ) : (
                              <FaUser style={{ color: currentColor }} className="animate-pulse" />
                            )}
                          </div>
                        </div>
                        {usernameError ? (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <FaTimesCircle />
                            {usernameError}
                          </p>
                        ) : (
                          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Username akan digunakan untuk login ke Green Science System
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="Contoh: user@sma1lhk.sch.id atau user@gmail.com"
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <FaEnvelope style={{ color: currentColor }} className="animate-pulse" />
                          </div>
                        </div>
                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Email untuk komunikasi dan notifikasi Green Science
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
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
                        Keamanan Akun
                      </h3>
                    </div>
                    
                    <div className="space-y-5">
                      {/* Password */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Buat password yang kuat"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FaEye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {password && (
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
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className={`block text-sm font-medium mb-3 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Konfirmasi Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfPassword ? "text" : "password"}
                            required
                            placeholder="Masukkan ulang password"
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
                            value={confPassword}
                            onChange={(e) => setConfPassword(e.target.value)}
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
                        {confPassword && (
                          <div className="mt-2 flex items-center gap-2">
                            {password === confPassword ? (
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
                    </div>
                  </div>

                  {/* Role Section */}
                  <div 
                    className="p-6 rounded-xl border"
                    style={{
                      backgroundColor: getColorWithOpacity(currentColor, 0.05),
                      borderColor: getColorWithOpacity(currentColor, 0.2)
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FaUserShield style={{ color: currentColor }} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Role Green Science
                      </h3>
                    </div>
                    
                    <label className={`block text-sm font-medium mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Pilih Role dalam Green Science Community
                    </label>
                    <div className="relative">
                      <select
                        name="role"
                        required
                        className={`block w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none ${
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
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="">Pilih Role Green Science</option>
                        <option value="admin">System Admin - Administrator Sistem</option>
                        <option value="guru">Green Educator - Pendidik Berkelanjutan</option>
                        <option value="siswa">Green Learner - Pembelajar Masa Depan</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {role ? getRoleIcon(role) : <FaUsers style={{ color: currentColor }} />}
                      </div>
                    </div>
                    
                    {role && (
                      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: getColorWithOpacity(currentColor, 0.1) }}>
                        <div className="flex items-center gap-2 mb-2">
                          {getRoleIcon(role)}
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {getRoleDisplayName(role)}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {getRoleDescription(role)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6">
                    <motion.button
                      type="button"
                      onClick={() => navigate("/users")}
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
                      disabled={isSubmitting || !isFormValid}
                      whileHover={{ scale: (isSubmitting || !isFormValid) ? 1 : 1.02 }}
                      whileTap={{ scale: (isSubmitting || !isFormValid) ? 1 : 0.98 }}
                      className={`flex items-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                        (isSubmitting || !isFormValid) ? "opacity-70 cursor-not-allowed" : "hover:shadow-xl"
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`,
                      }}
                    >
                      <FaSave className={isSubmitting ? "animate-spin" : ""} />
                      {isSubmitting ? "Mendaftarkan..." : "Daftarkan ke Green Community"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Registration Guide */}
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
                    <FaInfoCircle 
                      className="h-5 w-5" 
                      style={{ color: currentColor }}
                    />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Panduan Registrasi
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Username harus unik dan tanpa spasi
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Gunakan email valid untuk notifikasi
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Password minimal 6 karakter dengan kombinasi
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaCheckCircle style={{ color: currentColor }} className="text-sm mt-1 flex-shrink-0" />
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Pilih role sesuai dengan fungsi pengguna
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Green Science Benefits */}
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
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaLeaf style={{ color: currentColor }} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Green Science Benefits
                  </h3>
                </div>
                <div className="space-y-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.05) }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MdEco style={{ color: currentColor }} className="text-sm" />
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Pembelajaran Berkelanjutan
                      </p>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Akses ke materi IPA ramah lingkungan dan green economy
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.05) }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaRecycle style={{ color: currentColor }} className="text-sm" />
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Praktik Limbah Organik
                      </p>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pembelajaran hands-on pengolahan limbah organik
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: getColorWithOpacity(currentColor, 0.05) }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaSeedling style={{ color: currentColor }} className="text-sm" />
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Future Ready Skills
                      </p>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Keterampilan untuk masa depan yang berkelanjutan
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

export default AddUsers;