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
      className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white text-sm text-center font-medium p-3 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <FaLeaf className="absolute top-1 left-10 text-2xl animate-pulse" />
        <MdEco className="absolute top-1 right-10 text-2xl animate-bounce" />
      </div>
      
      <div className="relative z-10 flex items-center justify-center gap-2">
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
      
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors duration-300"
        onClick={handleClose}
        style={{ 
          zIndex: 20,
          minWidth: '32px',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FaTimes className="text-sm" />
      </button>
    </motion.div>
  );
};

export default NavbarBanner;