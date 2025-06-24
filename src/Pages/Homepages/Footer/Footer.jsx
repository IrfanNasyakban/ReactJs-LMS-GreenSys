import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaLeaf, FaRecycle } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { MdScience, MdEco } from "react-icons/md";
import { GiPlantSeed } from "react-icons/gi";

const Footer = () => {
  return (
    <div className="bg-gradient-to-br from-green-800 via-emerald-700 to-green-900 rounded-t-3xl relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl text-green-300">
          <FaLeaf />
        </div>
        <div className="absolute top-32 right-20 text-4xl text-emerald-300">
          <FaRecycle />
        </div>
        <div className="absolute bottom-20 left-32 text-5xl text-green-300">
          <GiPlantSeed />
        </div>
        <div className="absolute bottom-32 right-10 text-6xl text-emerald-300">
          <MdEco />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="container">
          <div className="grid md:grid-rows-1 md:gap-4 py-5 border-t-2 border-green-600/20 text-white">
            {/* brand info section */}
            <div className="py-8 px-4 space-y-4">
              <div className="text-2xl flex items-center gap-3 font-bold uppercase">
                <div className="bg-emerald-500 p-2 rounded-full">
                  <MdScience className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-white">GreenSys</p>
                  <p className="text-xs font-normal text-green-200 normal-case">
                    Green Science Learning Management System
                  </p>
                </div>
              </div>
              <p className="text-green-100 leading-relaxed">
                Platform pembelajaran IPA terintegrasi pengolahan limbah organik berbasis Green Economy 
                untuk meningkatkan literasi sains siswa melalui pendekatan berkelanjutan dan ramah lingkungan.
              </p>
              
              {/* Features Highlight */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 text-green-200">
                  <FaLeaf className="text-emerald-400" />
                  <span className="text-sm">Pembelajaran Hijau</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <FaRecycle className="text-emerald-400" />
                  <span className="text-sm">Pengolahan Limbah</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <MdScience className="text-emerald-400" />
                  <span className="text-sm">Literasi Sains</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <MdEco className="text-emerald-400" />
                  <span className="text-sm">Green Economy</span>
                </div>
              </div>
              
              <div className="flex items-center justify-start gap-5 !mt-8">
                <a href="#" className="hover:text-emerald-300 duration-200 bg-green-700 p-2 rounded-full hover:bg-green-600 transition-all">
                  <HiLocationMarker className="text-2xl" />
                </a>
                <a href="#" className="hover:text-emerald-300 duration-200 bg-green-700 p-2 rounded-full hover:bg-green-600 transition-all">
                  <FaInstagram className="text-2xl" />
                </a>
                <a href="#" className="hover:text-emerald-300 duration-200 bg-green-700 p-2 rounded-full hover:bg-green-600 transition-all">
                  <FaFacebook className="text-2xl" />
                </a>
                <a href="#" className="hover:text-emerald-300 duration-200 bg-green-700 p-2 rounded-full hover:bg-green-600 transition-all">
                  <FaLinkedin className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
          {/* copyright section  */}
          <div className="mt-4">
            <div className="text-center py-6 border-t-2 border-green-600/20">
              <span className="text-sm text-green-200">
                © 2024 GreenSys - Green Science Learning Management System | SMA 1 Lhokseumawe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;