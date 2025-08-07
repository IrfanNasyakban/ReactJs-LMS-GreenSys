import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginUser, reset } from "../features/authSlice";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaRecycle,
} from "react-icons/fa";
import { MdScience, MdEco } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isSuccess) {
      navigate("/dashboard");
    }
    if (isError || isSuccess) {
      const timer = setTimeout(() => {
        dispatch(reset());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, isSuccess, isError, dispatch, navigate]);

  const Auth = (e) => {
    e.preventDefault();
    dispatch(LoginUser({ username, password }));
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

      <div className="font-[sans-serif] relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
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
            <p className="text-gray-600 max-w-md mx-auto">
              Platform pembelajaran IPA terintegrasi Green Economy untuk masa
              depan berkelanjutan
            </p>
          </motion.div>

          <div className="flex justify-center w-full">
            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 opacity-10">
                <FaLeaf className="text-6xl text-green-500" />
              </div>

              <form onSubmit={Auth} className="space-y-6 relative z-10">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-100 p-2 rounded-full">
                      <FaLeaf className="text-emerald-600 text-sm" />
                    </div>
                    <h3 className="text-gray-800 text-2xl font-bold">
                      Masuk ke GreenSys
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Bergabunglah dengan revolusi pembelajaran hijau dan temukan
                    berbagai fitur untuk meningkatkan literasi sains Anda. Masa
                    depan berkelanjutan dimulai dari sini.
                  </p>
                </div>

                {/* Error Message */}
                {isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2"
                  >
                    <span className="font-medium">{message}</span>
                  </motion.div>
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
                      className="w-full text-sm text-gray-800 border border-green-300 px-4 py-3 pl-12 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                      placeholder="Masukkan username Anda"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <FaUser className="text-green-500" />
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
                      placeholder="Masukkan password Anda"
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
                </div>
                <div className="flex justify-between items-center">
                  {/* Button baru di sebelah kiri */}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors duration-300"
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </button>

                  {/* Button lupa password di sebelah kanan */}
                  <button
                    type="button"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors duration-300"
                    onClick={() => navigate("/forget-password")}
                  >
                    Lupa password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="!mt-8">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transform hover:scale-105 disabled:transform-none transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <FaLeaf />
                          Masuk ke GreenSys
                        </>
                      )}
                    </span>
                  </button>
                </div>

                {/* Additional Info */}
                <div className="text-center text-xs text-gray-500 mt-4">
                  <p>
                    Dengan masuk, Anda setuju untuk berkontribusi pada
                    pembelajaran berkelanjutan
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8 text-sm text-gray-500"
          >
            <p>
              © 2025 GreenSys - Green Science Learning Management System
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
