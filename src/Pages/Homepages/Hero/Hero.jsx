import React from "react";
import HeroImg from "../../../assets/heroimg.jpg";
import { FaLeaf, FaRecycle } from "react-icons/fa";
import { MdEco } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";
import { motion } from "framer-motion";
import Logo from "../../../assets/logo.png";

const Hero = () => {
  return (
    <>
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 relative overflow-hidden">
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
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 min-h-[650px] relative z-10">
          {/* brand info */}
          <div className="flex flex-col justify-center py-14 md:pr-16 xl:pr-40 md:py-0">
            <div className="text-center md:text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 justify-center md:justify-start"
              >
                <img
                              src={Logo} // ganti dengan path/logo kamu
                              alt="GreenSys Logo"
                              className="w-8 h-8 object-contain"
                            />
                <p className="text-emerald-700 uppercase font-bold text-sm bg-emerald-100 px-3 py-1 rounded-full">
                  Green Science Learning Platform
                </p>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold lg:text-5xl xl:text-6xl !leading-tight text-gray-800"
              >
                <span className="text-green-600">GreenSys</span> - Pembelajaran IPA 
                <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"> 
                  {" "}Terintegrasi Green Economy
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gray-600 leading-relaxed"
              >
                Platform pembelajaran IPA berbasis Green Economy yang mengintegrasikan pengolahan limbah organik 
                untuk meningkatkan literasi sains siswa melalui pendekatan berkelanjutan dan ramah lingkungan.
              </motion.p>

              {/* Features Icons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex gap-4 justify-center md:justify-start text-sm"
              >
                <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full">
                  <FaLeaf className="text-green-600" />
                  <span className="text-green-700 font-medium">Eco-Learning</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-100 px-3 py-2 rounded-full">
                  <FaRecycle className="text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Waste Management</span>
                </div>
              </motion.div>

              
            </div>
          </div>
          
          {/* Hero image */}
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
                  src={HeroImg}
                  alt="Green Science Learning"
                  className="w-[280px] sm:w-[320px] md:w-[550px] xl:w-[700px] rounded-2xl shadow-2xl border-4 border-green-200"
                />
                
                {/* Floating Elements - Responsive positioning */}
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 md:-top-6 md:-right-6 bg-emerald-500 p-2 sm:p-3 md:p-4 rounded-full shadow-lg animate-bounce">
                  <MdEco className="text-white text-lg sm:text-xl md:text-2xl" />
                </div>
                <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 bg-green-500 p-2 sm:p-3 md:p-4 rounded-full shadow-lg animate-pulse">
                  <GiPlantSeed className="text-white text-lg sm:text-xl md:text-2xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;