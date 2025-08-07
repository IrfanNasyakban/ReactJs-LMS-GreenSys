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
  FaGraduationCap,
  FaUserEdit,
  FaLightbulb,
  FaLeaf,
} from "react-icons/fa";
import {
  MdLibraryBooks,
  MdPerson,
  MdEmail,
  MdLocationOn,
  MdCake,
  MdSchool,
} from "react-icons/md";
import { BsPersonBadge } from "react-icons/bs";

const EditDataSiswa = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentColor, currentMode } = useStateContext();

  const isDark = currentMode === "Dark";
  const isOwnProfile = user && user.role === "siswa";

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace("#", "");
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
    if (!name) return "S";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getSiswaById();
      getKelas();
    } else {
      navigate("/login");
    }
  }, [navigate, id]);

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
      console.error("Error fetching kelas:", error);
      setError("Gagal memuat data kelas");
    }
  };

  const getSiswaById = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/siswa/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      setNis(data.nis || "");
      setNama(data.nama || "");
      setEmail(data.email || "");
      setNoHp(data.noHp || "");
      setKelasId(data.kelasId || "");
      setGender(data.gender || "");
      setTanggalLahir(formatDateForInput(data.tanggalLahir) || "");
      setAlamat(data.alamat || "");
      setPreview(data.url || null);
    } catch (error) {
      console.error("Error fetching siswa data:", error);
      setError("Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  const updateSiswa = async (e) => {
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
    if (!kelasId) {
      setError("Kelas harus dipilih");
      return;
    }

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

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      await axios.patch(`${apiUrl}/siswa/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Data siswa berhasil diperbarui!");

      setTimeout(() => {
        if (user && (user.role === "admin" || user.role === "guru")) {
          navigate("/siswa");
        } else if (user && user.role === "siswa") {
          navigate("/profile-saya");
        }
      }, 1500);
    } catch (error) {
      console.error("Error updating siswa:", error);
      if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else {
        setError("Gagal memperbarui data siswa");
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
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

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
            style={{
              borderColor: `${currentColor} transparent ${currentColor} ${currentColor}`,
            }}
          />
          <p className={`text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
            Memuat data siswa...
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
          <FaGraduationCap
            className="absolute top-20 left-10 text-8xl animate-pulse"
            style={{ color: currentColor }}
          />
          <FaLightbulb
            className="absolute top-40 right-20 text-6xl animate-bounce"
            style={{ color: currentColor, animationDelay: "1s" }}
          />
          <MdLibraryBooks
            className="absolute bottom-40 left-20 text-7xl animate-pulse"
            style={{ color: currentColor, animationDelay: "0.5s" }}
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
              onClick={() =>
                navigate(isOwnProfile ? "/profile-saya" : "/siswa")
              }
              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-300 ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <FaArrowLeft />
              {isOwnProfile ? "Profil Saya" : "Data Siswa"}
            </button>
            <FaChevronRight
              className={isDark ? "text-gray-500" : "text-gray-400"}
            />
            <span style={{ color: currentColor }} className="font-medium">
              {isOwnProfile ? "Edit Profil" : "Edit Data Siswa"}
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
                    {isOwnProfile ? "Profil" : "Siswa"}
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
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <div className="relative inline-block">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold"
                      style={{
                        backgroundColor: getColorWithOpacity(currentColor, 0.2),
                      }}
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
                  {nama || "Nama Siswa"}
                </h3>
                <p className="text-white opacity-90 text-sm">
                  NIS: {nis || "Belum diisi"}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                    <span className="text-white text-xs font-medium">
                      Siswa
                    </span>
                  </div>
                  {kelasId && kelasList.find((k) => k.id == kelasId) && (
                    <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                      <span className="text-white text-xs font-medium">
                        {kelasList.find((k) => k.id == kelasId)?.kelas}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h4
                      className={`font-semibold mb-2 ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Preview Data
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        >
                          Email:
                        </span>
                        <span
                          className={isDark ? "text-gray-300" : "text-gray-700"}
                        >
                          {email || "Belum diisi"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        >
                          Gender:
                        </span>
                        <span
                          className={isDark ? "text-gray-300" : "text-gray-700"}
                        >
                          {gender === "Laki-laki"
                            ? "Laki-laki"
                            : gender === "Perempuan"
                            ? "Perempuan"
                            : "Belum dipilih"}
                        </span>
                      </div>
                      {tanggalLahir && (
                        <div className="flex justify-between">
                          <span
                            className={
                              isDark ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            Lahir:
                          </span>
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {new Date(tanggalLahir).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {file && (
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        } mb-2`}
                      >
                        Foto Baru:
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
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
              className="rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`,
              }}
            >
              <div
                className="py-4 sm:py-6 px-4 sm:px-8"
                style={{
                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                    currentColor,
                    0.8
                  )} 100%)`,
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaEdit className="text-white text-lg sm:text-xl" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Form {isOwnProfile ? "Edit Profil" : "Edit Data Siswa"}
                  </h2>
                  <FaLeaf className="text-white text-base sm:text-lg animate-pulse ml-auto" />
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={updateSiswa} className="space-y-4 sm:space-y-6">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={loadImage}
                    className="hidden"
                  />

                  {/* NIS & Nama */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <BsPersonBadge
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          NIS (Nomor Induk Siswa)
                        </label>
                      </div>
                      <input
                        type="text"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="Masukkan NIS"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      />
                    </div>

                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MdPerson
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Nama Lengkap *
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Email & Kelas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MdEmail
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Email *
                        </label>
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      />
                    </div>

                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MdSchool
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Kelas *
                        </label>
                      </div>
                      <select
                        required
                        value={kelasId}
                        onChange={(e) => setKelasId(e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      >
                        <option value="">Pilih Kelas</option>
                        {kelasList.map((kelas) => (
                          <option key={kelas.id} value={kelas.id}>
                            {kelas.kelas}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gender & Tanggal Lahir */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <FaVenusMars
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Jenis Kelamin
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <label
                          className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                            gender === "Laki-laki"
                              ? `border-transparent text-white`
                              : isDark
                              ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          }`}
                          style={
                            gender === "Laki-laki"
                              ? {
                                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                                    currentColor,
                                    0.8
                                  )} 100%)`,
                                }
                              : {}
                          }
                        >
                          <input
                            type="radio"
                            name="gender"
                            value="Laki-laki"
                            checked={gender === "Laki-laki"}
                            onChange={(e) => setGender(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-xs sm:text-sm font-medium">
                            Laki-laki
                          </span>
                        </label>
                        <label
                          className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                            gender === "Perempuan"
                              ? `border-transparent text-white`
                              : isDark
                              ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          }`}
                          style={
                            gender === "Perempuan"
                              ? {
                                  background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(
                                    currentColor,
                                    0.8
                                  )} 100%)`,
                                }
                              : {}
                          }
                        >
                          <input
                            type="radio"
                            name="gender"
                            value="Perempuan"
                            checked={gender === "Perempuan"}
                            onChange={(e) => setGender(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-xs sm:text-sm font-medium">
                            Perempuan
                          </span>
                        </label>
                      </div>
                    </div>

                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MdCake
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Tanggal Lahir
                        </label>
                      </div>
                      <input
                        type="date"
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-gray-900 border-gray-300"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Alamat & No HP */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <MdLocationOn
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          Alamat
                        </label>
                      </div>
                      <textarea
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none resize-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      />
                    </div>

                    <div
                      className="p-3 sm:p-4 rounded-lg sm:rounded-xl border"
                      style={{
                        backgroundColor: getColorWithOpacity(
                          currentColor,
                          0.05
                        ),
                        borderColor: getColorWithOpacity(currentColor, 0.2),
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <FaPhone
                          style={{ color: currentColor }}
                          className="text-sm sm:text-base"
                        />
                        <label
                          className={`font-medium text-sm sm:text-base ${
                            isDark ? "text-white" : "text-gray-800"
                          }`}
                        >
                          No HP
                        </label>
                      </div>
                      <input
                        type="tel"
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        placeholder="Masukkan nomor HP"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all duration-300 focus:outline-none text-sm sm:text-base ${
                          isDark
                            ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                            : "bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        }`}
                        style={{
                          borderColor: getColorWithOpacity(currentColor, 0.3),
                          boxShadow: `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`,
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = currentColor;
                          e.target.style.boxShadow = `0 0 0 3px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = getColorWithOpacity(
                            currentColor,
                            0.3
                          );
                          e.target.style.boxShadow = `0 0 0 1px ${getColorWithOpacity(
                            currentColor,
                            0.1
                          )}`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
                    <motion.button
                      type="button"
                      onClick={() =>
                        navigate(isOwnProfile ? "/profile-saya" : "/siswa")
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                        isDark
                          ? "border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <FaTimes className="text-sm" />
                      Batal
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 border border-transparent rounded-lg sm:rounded-xl shadow-lg text-xs sm:text-sm font-medium text-white transition-all duration-300 ${
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
                      <FaSave
                        className={`text-sm ${
                          isSubmitting ? "animate-spin" : ""
                        }`}
                      />
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

export default EditDataSiswa;
