import React from 'react';
import { FaLeaf, FaRecycle, FaHeart } from 'react-icons/fa';
import { MdScience, MdEco } from 'react-icons/md';
import { GiPlantSeed } from 'react-icons/gi';
import { useStateContext } from '../contexts/ContextProvider';

const Footer = () => {
  const { currentColor, currentMode } = useStateContext();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div className="mt-16 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <FaLeaf 
          className="absolute top-4 left-10 text-4xl animate-pulse" 
          style={{ color: currentColor }}
        />
        <FaRecycle 
          className="absolute top-4 right-10 text-3xl animate-bounce" 
          style={{ color: currentColor }}
        />
        <GiPlantSeed 
          className="absolute bottom-4 left-20 text-4xl animate-pulse" 
          style={{ color: currentColor }}
        />
        <MdEco 
          className="absolute bottom-4 right-20 text-4xl animate-bounce" 
          style={{ color: currentColor }}
        />
      </div>

      {/* Main Footer Content */}
      <div 
        className={`relative z-10 py-8 mx-4 rounded-t-2xl border-t ${
          currentMode === 'Dark' ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{
          background: currentMode === 'Dark' 
            ? `linear-gradient(135deg, ${getColorWithOpacity(currentColor, 0.1)} 0%, ${getColorWithOpacity(currentColor, 0.05)} 100%)`
            : `linear-gradient(135deg, ${getColorWithOpacity(currentColor, 0.08)} 0%, ${getColorWithOpacity(currentColor, 0.12)} 100%)`,
          borderColor: getColorWithOpacity(currentColor, 0.2)
        }}
      >
        {/* Green Science Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <MdScience className="text-white text-lg" />
            </div>
            <h3 className={`text-lg font-bold ${
              currentMode === 'Dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Green<span style={{ color: currentColor }}>Sys</span>
            </h3>
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <FaLeaf className="text-white text-lg" />
            </div>
          </div>
          <p className={`text-sm max-w-md mx-auto leading-relaxed ${
            currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Green Science Learning Management System - Platform pembelajaran IPA terintegrasi 
            pengolahan limbah organik dan green economy untuk masa depan berkelanjutan
          </p>
        </div>

        {/* Green Values */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
            }}
          >
            <FaLeaf 
              className="text-sm" 
              style={{ color: currentColor }}
            />
            <span className={`text-xs font-medium ${
              currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Eco-Learning
            </span>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
            }}
          >
            <FaRecycle 
              className="text-sm" 
              style={{ color: currentColor }}
            />
            <span className={`text-xs font-medium ${
              currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Sustainable Science
            </span>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
            }}
          >
            <MdEco 
              className="text-sm" 
              style={{ color: currentColor }}
            />
            <span className={`text-xs font-medium ${
              currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Green Economy
            </span>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              backgroundColor: getColorWithOpacity(currentColor, 0.1),
              border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
            }}
          >
            <GiPlantSeed 
              className="text-sm" 
              style={{ color: currentColor }}
            />
            <span className={`text-xs font-medium ${
              currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Future Ready
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <div className={`flex items-center justify-center gap-2 text-sm ${
            currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>© 2025 GreenSys - Made with</span>
            <FaHeart className="text-red-500 animate-pulse" />
            <span>for sustainable education</span>
          </div>
          <p className={`text-xs mt-1 ${
            currentMode === 'Dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            SMA 1 Lhokseumawe | Green Science Learning Management System
          </p>
        </div>

        {/* Environmental Quote */}
        <div className="mt-6 text-center">
          <div 
            className={`backdrop-blur-sm rounded-xl p-4 max-w-lg mx-auto border ${
              currentMode === 'Dark' ? 'border-gray-600' : 'border-gray-200'
            }`}
            style={{
              backgroundColor: currentMode === 'Dark' 
                ? getColorWithOpacity(currentColor, 0.08)
                : getColorWithOpacity(currentColor, 0.05),
              borderColor: getColorWithOpacity(currentColor, 0.2)
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaLeaf 
                className="animate-pulse" 
                style={{ color: currentColor }}
              />
              <span className={`text-xs font-semibold ${
                currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Green Science Quote
              </span>
              <FaLeaf 
                className="animate-pulse" 
                style={{ color: currentColor }}
              />
            </div>
            <p className={`text-xs italic leading-relaxed ${
              currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              "Pendidikan sains hijau hari ini adalah investasi untuk planet yang berkelanjutan besok"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;