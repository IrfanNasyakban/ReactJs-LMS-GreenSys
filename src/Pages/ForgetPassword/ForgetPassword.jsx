import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLeaf, FaEnvelope, FaArrowLeft, FaRecycle, FaInfoCircle } from "react-icons/fa";
import { MdScience, MdEco } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const sendResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage("");
    setIsError(false);

    const jsonData = {
      email: email,
    };

    try {
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.post(
        `${apiUrl}/send-link-reset-password`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponseMessage(response.data.msg);
      setIsSubmitting(false);
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      setIsError(true);
      setResponseMessage(error.response?.data?.msg || "Terjadi kesalahan saat mengirim email reset password");
      setIsSubmitting(false);
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
        <MdScience className="absolute top-1/2 right-32 text-6xl text-green-600 animate-pulse" />
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
              <p className="text-sm text-gray-600">Green Science Learning Management System</p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* Card Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10">
              <FaLeaf className="text-6xl text-green-500" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-6 px-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Reset Password</h1>
                  <p className="text-green-100 text-sm">Pulihkan akses ke GreenSys Anda</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 relative z-10">
              <form onSubmit={sendResetPassword} className="space-y-6">
                {/* Response Message */}
                {responseMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border flex items-start gap-3 ${
                      isError
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-green-50 text-green-800 border-green-200"
                    }`}
                  >
                    <div className={`p-1 rounded-full ${isError ? 'bg-red-200' : 'bg-green-200'}`}>
                      <FaInfoCircle className={`text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{responseMessage}</p>
                      {!isError && (
                        <p className="text-xs mt-1 opacity-80">
                          Silakan cek email Anda dan ikuti instruksi untuk reset password.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Email Input */}
                <div className="bg-green-50/50 backdrop-blur-sm p-6 rounded-xl border border-green-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Contoh: nama@sma1lhok.sch.id, nama@gmail.com"
                      className="block w-full px-4 py-3 pl-12 rounded-lg border border-green-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white/80"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaEnvelope className="text-green-500" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                    <FaLeaf className="text-green-500 text-xs" />
                    Masukkan email yang terdaftar untuk mereset password Anda
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  >
                    <FaArrowLeft className="text-xs" />
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transform hover:scale-105 disabled:transform-none transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <FaEnvelope />
                        Kirim Link Reset
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
                <h3 className="font-semibold text-gray-800 mb-2">Informasi Penting</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FaLeaf className="text-green-500 text-xs" />
                    Gunakan email yang sudah terdaftar di sistem GreenSys
                  </p>
                  <p className="flex items-center gap-2">
                    <MdEco className="text-emerald-500 text-xs" />
                    Pastikan email sudah diisi dengan benar dan aktif
                  </p>
                  <p className="flex items-center gap-2">
                    <FaRecycle className="text-green-500 text-xs" />
                    Link reset password akan kadaluarsa dalam 24 jam
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8 text-sm text-gray-500"
          >
            <p>© 2024 GreenSys - Green Science Learning Management System</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;