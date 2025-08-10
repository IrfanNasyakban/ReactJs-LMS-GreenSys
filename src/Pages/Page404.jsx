import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaLeaf,
  FaRecycle,
  FaTools,
  FaHome,
  FaCog,
  FaHeart,
} from 'react-icons/fa';
import { MdScience, MdEco, MdConstruction } from 'react-icons/md';
import { GiPlantSeed } from 'react-icons/gi';
import ErrorImg from "../assets/error404.png";

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 relative overflow-hidden min-h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-8xl text-green-600">
          <FaLeaf />
        </div>
        <div className="absolute top-40 right-20 text-6xl text-emerald-600">
          <FaRecycle />
        </div>
        <div className="absolute bottom-32 left-32 text-7xl text-green-600">
          <GiPlantSeed />
        </div>
        <div className="absolute bottom-20 right-10 text-8xl text-emerald-600">
          <MdEco />
        </div>
        <div className="absolute top-1/3 right-1/3 text-5xl text-green-600">
          <FaTools />
        </div>
      </div>

      <div className="container grid grid-cols-1 md:grid-cols-2 min-h-screen relative z-10">
        {/* Left Content - Maintenance Info */}
        <div className="flex flex-col justify-center py-14 md:pr-16 xl:pr-40 md:py-0">
          <div className="text-center md:text-left space-y-6">
            {/* Header Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 justify-center md:justify-start"
            >
              <div className="bg-emerald-500 p-2 rounded-full">
                <MdConstruction className="text-white text-xl" />
              </div>
              <p className="text-emerald-700 uppercase font-bold text-sm bg-emerald-100 px-3 py-1 rounded-full">
                System Maintenance
              </p>
            </motion.div>
            
            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold lg:text-5xl xl:text-6xl !leading-tight text-gray-800"
            >
              <span className="text-green-600">Under</span>{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Maintenance
              </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-600 leading-relaxed text-lg"
            >
              Sistem GreenSys sedang dalam pemeliharaan untuk memberikan pengalaman pembelajaran yang lebih baik. 
              Kami sedang meningkatkan fitur pembelajaran berkelanjutan untuk masa depan yang lebih hijau.
            </motion.p>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="pt-4"
            >
              <button
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaHome />
                  Kembali
                </span>
              </button>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center md:text-left text-sm text-gray-500 pt-4"
            >
              <p>
                Terima kasih atas kesabaran Anda dalam mendukung pembelajaran berkelanjutan
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Right Content - Error Image */}
        <div className="flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="relative"
          >
            {/* Mobile: Image container with spacing for floating elements */}
            <div className="relative mx-8 my-8 md:mx-0 md:my-0">
              <img
                src={ErrorImg}
                alt="Under Maintenance"
                className="w-[280px] sm:w-[320px] md:w-[550px] xl:w-[700px] rounded-2xl shadow-2xl border-4 border-green-200"
              />
              
              {/* Floating Elements - Responsive positioning */}
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 bg-emerald-500 p-2 sm:p-3 md:p-4 rounded-full shadow-lg animate-bounce">
                <MdConstruction className="text-white text-lg sm:text-xl md:text-2xl" />
              </div>
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-green-500 p-2 sm:p-3 md:p-4 rounded-full shadow-lg animate-pulse">
                <FaTools className="text-white text-lg sm:text-xl md:text-2xl" />
              </div>
              <div className="absolute top-1/2 -left-4 sm:-left-5 md:-left-6 transform -translate-y-1/2 bg-emerald-600 p-2 sm:p-3 md:p-4 rounded-full shadow-lg animate-bounce">
                <FaCog className="text-white text-lg sm:text-xl md:text-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Page404;