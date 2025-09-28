import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaRecycle,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";
import { MdScience, MdEco } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

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
    return { strength, label: "Sangat Kuat", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength(password);

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

  // Form validation
  const isFormValid = username && 
                     email && 
                     password && 
                     confPassword && 
                     !usernameError && 
                     password === confPassword &&
                     passwordStrength.strength >= 3;

  const saveUsers = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    // Validasi konfirmasi password
    if (password !== confPassword) {
      setSubmitError("Password dan konfirmasi password tidak cocok");
      setIsSubmitting(false);
      return;
    }

    // Validasi kekuatan password
    if (passwordStrength.strength < 3) {
      setSubmitError("Password terlalu lemah. Gunakan kombinasi huruf, angka, dan karakter khusus");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confPassword", confPassword);
    formData.append("role", "siswa");

    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.post(`${apiUrl}/users`, jsonData);
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setSubmitError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  const handleModalOK = () => {
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <FaLeaf className="absolute top-20 left-20 text-8xl text-green-600 animate-pulse" />
        <FaRecycle className="absolute top-40 right-20 text-6xl text-emerald-600 animate-bounce" />
        <GiPlantSeed className="absolute bottom-32 left-32 text-7xl text-green-600 animate-pulse" />
        <MdEco className="absolute bottom-20 right-10 text-8xl text-emerald-600 animate-bounce" />
        <MdScience className="absolute top-1/2 left-10 text-6xl text-green-600 animate-pulse" />
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <FaCheckCircle className="text-green-500 text-4xl" />
                </div>
              </div>
              
              {/* Success Title */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Registrasi Berhasil!
              </h3>
              
              {/* Success Message */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                Selamat! Akun Anda telah berhasil dibuat. Silahkan login untuk mengakses modul pembelajaran dan memulai perjalanan belajar berkelanjutan Anda.
              </p>
              
              {/* OK Button */}
              <button
                onClick={handleModalOK}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <GiPlantSeed />
                  OK, Lanjut ke Login
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="font-[sans-serif] relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-emerald-500 p-3 rounded-full">
                <MdScience className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Green<span className="text-emerald-600">Sys</span>
                </h1>
                <p className="text-sm text-gray-600">
                  Green Science Learning Management System
                </p>
              </div>
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              Bergabunglah dengan komunitas pembelajaran IPA berkelanjutan dan
              mulai perjalanan hijau Anda
            </p>
          </div>

          <div className="flex justify-center w-full">
            {/* Register Form */}
            <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 opacity-10">
                <FaLeaf className="text-6xl text-green-500" />
              </div>

              <div className="space-y-6 relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <GiPlantSeed className="text-emerald-600 text-sm" />
                    </div>
                    <h3 className="text-gray-800 text-2xl font-bold">
                      Daftar GreenSys
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Mulai perjalanan pembelajaran berkelanjutan Anda. Daftar
                    sekarang dan jadilah bagian dari revolusi pendidikan hijau
                    yang mengubah masa depan.
                  </p>
                </div>

                {/* Success Message */}
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-medium">{submitSuccess}</span>
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="font-medium">{submitError}</span>
                  </div>
                )}

                {/* Username Field */}
                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      name="username"
                      type="text"
                      required
                      className={`w-full text-sm text-gray-800 border px-4 py-3 pl-12 rounded-lg outline-none focus:ring-2 transition-all duration-300 ${
                        usernameError 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-green-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                      placeholder="Pilih username unik Anda"
                      value={username}
                      onChange={handleUsernameChange}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaUser className="text-green-500" />
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full text-sm text-gray-800 border border-green-300 px-4 py-3 pl-12 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                      placeholder="Masukkan alamat email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaEnvelope className="text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full text-sm text-gray-800 border border-green-300 px-4 py-3 pl-12 pr-12 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                      placeholder="Buat password yang kuat"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaLock className="text-green-500" />
                    </div>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Kekuatan Password:</span>
                        <span 
                          className="text-xs font-semibold"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(passwordStrength.strength / 5) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        ></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        <p>Password harus mengandung:</p>
                        <ul className="mt-1 space-y-1">
                          <li className={`flex items-center gap-1 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="text-xs">•</span>
                            Minimal 6 karakter
                          </li>
                          <li className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="text-xs">•</span>
                            Huruf kecil (a-z)
                          </li>
                          <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="text-xs">•</span>
                            Huruf besar (A-Z)
                          </li>
                          <li className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="text-xs">•</span>
                            Angka (0-9)
                          </li>
                          <li className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className="text-xs">•</span>
                            Karakter khusus (!@#$%^&*)
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      name="confPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className={`w-full text-sm text-gray-800 border px-4 py-3 pl-12 pr-12 rounded-lg outline-none focus:ring-2 transition-all duration-300 ${
                        confPassword && password !== confPassword
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-green-300 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                      placeholder="Konfirmasi password Anda"
                      value={confPassword}
                      onChange={(e) => setConfPassword(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaLock className="text-green-500" />
                    </div>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confPassword && password !== confPassword && (
                    <p className="text-red-500 text-xs mt-1">Password tidak cocok</p>
                  )}
                  {confPassword && password === confPassword && (
                    <p className="text-green-500 text-xs mt-1">Password cocok ✓</p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors duration-300"
                  >
                    Sudah punya akun? Masuk di sini
                  </button>
                </div>

                {/* Register Button */}
                <div className="!mt-8">
                  <button
                    type="button"
                    onClick={saveUsers}
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full font-bold py-3 px-4 rounded-lg transform transition-all duration-300 shadow-lg ${
                      isFormValid && !isSubmitting
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105 hover:shadow-xl'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Mendaftar...
                        </>
                      ) : (
                        <>
                          <GiPlantSeed />
                          Daftar GreenSys
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Terms and Conditions */}
                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>
                    Dengan mendaftar, Anda setuju dengan{" "}
                    <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-semibold">
                      Syarat & Ketentuan
                    </span>{" "}
                    dan{" "}
                    <span className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-semibold">
                      Kebijakan Privasi
                    </span>{" "}
                    kami untuk pembelajaran berkelanjutan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2025 GreenSys - Green Science Learning Management System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;