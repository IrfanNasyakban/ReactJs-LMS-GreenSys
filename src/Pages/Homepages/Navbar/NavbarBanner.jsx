import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLeaf, FaTimes } from "react-icons/fa";
import { MdEco } from "react-icons/md";

const NavbarBanner = ({ onClose }) => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    console.log("Close button clicked!"); // Debug log
    console.log("onClose function:", onClose); // Debug log
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white text-center font-medium relative overflow-hidden
                 p-1.5 sm:p-3
                 text-xs sm:text-sm md:text-sm"
    >
      {/* Background Pattern - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 opacity-10 hidden sm:block">
        <FaLeaf className="absolute top-1 left-10 text-2xl animate-pulse" />
        <MdEco className="absolute top-1 right-10 text-2xl animate-bounce" />
      </div>
      
      {/* Mobile Layout (Stacked) */}
      <div className="relative z-10 sm:hidden">
        <div className="flex items-center justify-center gap-1 mb-1.5">
          <div className="bg-white/20 p-0.5 rounded-full">
            <FaLeaf className="text-xs" />
          </div>
          <span className="text-xs leading-tight px-1">
            <strong>Green Science</strong> - Masa Depan Hijau!
          </span>
          <a 
            onClick={() => navigate('/login')}
            className="bg-white text-emerald-600 font-bold px-2 py-0.5 rounded-full hover:bg-green-50 transition-colors duration-300 cursor-pointer text-xs whitespace-nowrap ml-1"
          >
            Mulai
          </a>
        </div>
      </div>
      
      {/* Tablet Layout (Single line with wrapped text) */}
      <div className="relative z-10 hidden sm:flex md:hidden items-center justify-center gap-2 flex-wrap">
        <div className="bg-white/20 p-1 rounded-full">
          <FaLeaf className="text-sm" />
        </div>
        <span className="text-sm text-center">
          <strong>Green Science</strong> - Revolusi pembelajaran hijau untuk masa depan berkelanjutan!
        </span>
        <a 
          onClick={() => navigate('/login')}
          className="bg-white text-emerald-600 font-bold px-3 py-1 rounded-full hover:bg-green-50 transition-colors duration-300 transform hover:scale-105 cursor-pointer text-sm whitespace-nowrap"
        >
          Mulai Sekarang
        </a>
      </div>
      
      {/* Desktop Layout (Original) */}
      <div className="relative z-10 hidden md:flex items-center justify-center gap-2">
        <div className="bg-white/20 p-1 rounded-full">
          <FaLeaf className="text-sm" />
        </div>
        <span>
          Bergabunglah dengan revolusi pembelajaran hijau! 
          <strong className="ml-1">Pelajari Green Science</strong> dan bangun masa depan berkelanjutan.
        </span>
        <a 
          onClick={() => navigate('/login')}
          className="ml-3 bg-white text-emerald-600 font-bold px-4 py-1 rounded-full hover:bg-green-50 transition-colors duration-300 transform hover:scale-105 cursor-pointer"
        >
          Mulai Sekarang
        </a>
      </div>
      
      {/* Close Button - Responsive positioning */}
      <button
        className="absolute top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-300
                   right-2 p-1 sm:right-3 sm:p-1.5 md:right-4"
        onClick={handleClose}
        style={{ 
          zIndex: 20,
          minWidth: '28px',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FaTimes className="text-xs sm:text-sm" />
      </button>
    </motion.div>
  );
};

export default NavbarBanner;