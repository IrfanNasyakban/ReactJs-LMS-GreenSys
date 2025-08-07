import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLeaf,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaRecycle,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { MdScience, MdEco } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const ResetPasswordViaEmail = () => {
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confNewPassword, setConfNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setMsg("Token tidak valid atau tidak ditemukan");
      setIsError(true);
      setModalType("error");
      setShowModal(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg("");
    setIsError(false);
    setIsSuccess(false);

    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.post(`${apiUrl}/reset-password`, {
        token,
        newPassword,
        confNewPassword,
      });

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

      if (errorMessage.includes("Token telah kedaluwarsa")) {
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
    navigate("/login");
  };

  const handleErrorModalClose = () => {
    setShowModal(false);
    if (modalType === "invalid") {
      navigate("/forget-password");
    }
  };

  const toggleNewPasswordVisibility = () =>
    setShowNewPassword(!showNewPassword);
  const toggleConfPasswordVisibility = () =>
    setShowConfPassword(!showConfPassword);

  const getModalIcon = () => {
    switch (modalType) {
      case "success":
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case "invalid":
        return <FaExclamationTriangle className="text-yellow-500 text-4xl" />;
      default:
        return <FaTimes className="text-red-500 text-4xl" />;
    }
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "success":
        return "Password Berhasil Diubah!";
      case "invalid":
        return "Token Tidak Valid";
      default:
        return "Gagal Mengubah Password";
    }
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

      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
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
        </motion.div>

        <div className="max-w-lg w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* Card Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10">
              <FaLock className="text-6xl text-green-500" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-6 px-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaLock className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Reset Password
                  </h1>
                  <p className="text-green-100 text-sm">
                    Buat password baru untuk akun GreenSys Anda
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-green-50/50 backdrop-blur-sm p-6 rounded-xl border border-green-100">
                  {/* New Password */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Masukkan password baru"
                        className="block w-full px-4 py-3 pl-12 pr-12 rounded-lg border border-green-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/80"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FaLock className="text-green-500" />
                      </div>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-300"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                      <FaLeaf className="text-green-500 text-xs" />
                      Password minimal 6 karakter dengan kombinasi huruf dan
                      angka
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfPassword ? "text" : "password"}
                        required
                        placeholder="Konfirmasi password baru"
                        className="block w-full px-4 py-3 pl-12 pr-12 rounded-lg border border-green-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/80"
                        value={confNewPassword}
                        onChange={(e) => setConfNewPassword(e.target.value)}
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FaLock className="text-green-500" />
                      </div>
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-300"
                        onClick={toggleConfPasswordVisibility}
                      >
                        {showConfPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                      <MdEco className="text-emerald-500 text-xs" />
                      Masukkan kembali password untuk konfirmasi
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transform hover:scale-105 disabled:transform-none transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <FaLock />
                        Reset Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 bg-white/80 backdrop-blur-sm border-l-4 border-emerald-500 p-6 rounded-lg shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 p-2 rounded-full flex-shrink-0">
                <FaInfoCircle className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Tips Keamanan Password
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FaLeaf className="text-green-500 text-xs" />
                    Gunakan kombinasi huruf besar, kecil, angka, dan simbol
                  </p>
                  <p className="flex items-center gap-2">
                    <MdEco className="text-emerald-500 text-xs" />
                    Hindari menggunakan informasi pribadi dalam password
                  </p>
                  <p className="flex items-center gap-2">
                    <FaRecycle className="text-green-500 text-xs" />
                    Jangan gunakan password yang sama dengan akun lain
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500/75"
                onClick={
                  modalType === "success"
                    ? handleSuccessModalClose
                    : handleErrorModalClose
                }
              />

              {/* Modal - Hapus backdrop-blur dari sini */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-green-200 relative z-10"
              >
                <div className="px-6 pt-6 pb-4">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="mb-4">{getModalIcon()}</div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {getModalTitle()}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{msg}</p>
                      {modalType === "success" && (
                        <p className="text-sm text-gray-500 mt-2">
                          Anda akan diarahkan ke halaman login untuk masuk
                          dengan password baru.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal footer - Tambahkan bg-white untuk memastikan tidak blur */}
                <div className="bg-white px-6 py-4 flex justify-center border-t border-gray-100">
                  <button
                    type="button"
                    onClick={
                      modalType === "success"
                        ? handleSuccessModalClose
                        : handleErrorModalClose
                    }
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-2 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                  >
                    {modalType === "success" ? "Lanjut ke Login" : "OK"}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResetPasswordViaEmail;
