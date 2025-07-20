import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getMe, LogOut, reset } from "../features/authSlice";

import { MdOutlineCancel, MdScience } from "react-icons/md";
import { AiOutlineLogout } from "react-icons/ai";
import { 
  FaUser, 
  FaLeaf, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUserShield,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";

const UserProfile = () => {
  const [nama, setNama] = useState(null);
  const [urlImage, setUrlImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentColor, currentMode, setIsClicked, initialState } = useStateContext();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && user) {
      fetchUserProfile();
    }
  }, [user]);

  // Helper function for colors
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isDark = currentMode === 'Dark';

  // Fetch user profile based on role
  const fetchUserProfile = async () => {
    if (!user || user.role === 'admin') return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const endpoint = user.role === "guru" ? "/profile-guru" : "/profile-siswa";
      
      const response = await axios.get(`${apiUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data?.url) {
        setUrlImage(response.data.data.url);
        setNama(response.data.data.nama);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get role information with dynamic colors
  const getRoleInfo = () => {
    const bgOpacity = isDark ? 0.15 : 0.1;
    const backgroundColor = getColorWithOpacity(currentColor, bgOpacity);
    const borderColor = getColorWithOpacity(currentColor, 0.3);

    switch(user?.role) {
      case 'siswa': 
        return {
          title: 'Green Learner',
          description: 'Student of Green Science',
          icon: FaGraduationCap,
          bgColor: backgroundColor,
          borderColor: borderColor,
          textColor: currentColor
        };
      case 'guru': 
        return {
          title: 'Green Educator',
          description: 'Teacher of Sustainable Science',
          icon: FaChalkboardTeacher,
          bgColor: backgroundColor,
          borderColor: borderColor,
          textColor: currentColor
        };
      case 'admin': 
        return {
          title: 'System Administrator',
          description: 'GreenSys Manager',
          icon: FaUserShield,
          bgColor: backgroundColor,
          borderColor: borderColor,
          textColor: currentColor
        };
      default: 
        return {
          title: 'User',
          description: 'System User',
          icon: FaUser,
          bgColor: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)',
          borderColor: isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.3)',
          textColor: isDark ? '#9CA3AF' : '#6B7280'
        };
    }
  };

  const roleInfo = getRoleInfo();
  const IconComponent = roleInfo.icon;

  const handleClose = () => {
    setIsClicked(initialState);
  };

  const handleLogout = async () => {
    try {
      await dispatch(LogOut());
      dispatch(reset());
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileNavigation = () => {
    setIsClicked(initialState);
    navigate('/profile-saya');
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <div 
      className="backdrop-blur-sm rounded-2xl w-80 shadow-2xl z-[9999] relative border"
      style={{ 
        backgroundColor: isDark 
          ? 'rgba(31, 41, 55, 0.95)' // Dark mode - lebih solid
          : 'rgba(255, 255, 255, 0.98)', // Light mode - hampir solid
        borderColor: getColorWithOpacity(currentColor, 0.2)
      }}
    >
      {/* Header */}
      <div 
        className="p-4 rounded-t-2xl border-b"
        style={{ 
          backgroundColor: isDark 
            ? 'rgba(55, 65, 81, 0.8)' // Dark mode header
            : 'rgba(249, 250, 251, 0.8)', // Light mode header
          borderBottomColor: getColorWithOpacity(currentColor, 0.2)
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <MdScience className="text-white text-lg" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Green Profile
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                GreenSys Account
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-all duration-300 ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MdOutlineCancel className="text-lg" />
          </button>
        </div>
      </div>

      {/* User Info Section */}
      <div className="p-4">
        <div 
          className="flex gap-4 items-center p-4 rounded-xl border mb-4"
          style={{ 
            backgroundColor: isDark 
              ? 'rgba(55, 65, 81, 0.6)' // Dark mode card
              : 'rgba(249, 250, 251, 0.6)', // Light mode card
            borderColor: getColorWithOpacity(currentColor, 0.15)
          }}
        >
          {/* Avatar */}
          <div className="relative">
            {loading ? (
              <div 
                className="w-14 h-14 rounded-full animate-pulse"
                style={{ backgroundColor: getColorWithOpacity(currentColor, 0.2) }}
              />
            ) : (
              <img
                className="w-14 h-14 rounded-full object-cover border-2"
                style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
                src={urlImage && urlImage !== "http://localhost:5000/images/null" ? urlImage : avatar}
                alt="user-profile"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />
            )}
            <div 
              className="absolute -bottom-1 -right-1 p-1 rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <FaLeaf className="text-white text-xs" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {nama ? capitalizeFirstLetter(nama) : "Admin"}
            </h4>
            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email || "admin@greensys.com"}
            </p>
            
            {/* Role Badge - HANYA INI YANG TRANSPARAN */}
            <div 
              className="flex items-center gap-2 px-2 py-1 rounded-full mt-2 w-fit border"
              style={{
                backgroundColor: roleInfo.bgColor, // Transparan dengan currentColor
                borderColor: roleInfo.borderColor
              }}
            >
              <IconComponent 
                className="text-xs" 
                style={{ color: roleInfo.textColor }} 
              />
              <span 
                className="text-xs font-medium"
                style={{ color: roleInfo.textColor }}
              >
                {roleInfo.title}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Action - Only for non-admin */}
        {user && user.role !== 'admin' && (
          <div 
            onClick={handleProfileNavigation}
            className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all duration-300 mb-4 border ${
              isDark 
                ? 'hover:bg-gray-700/50' 
                : 'hover:bg-gray-50'
            }`}
            style={{ 
              backgroundColor: isDark 
                ? 'rgba(55, 65, 81, 0.4)' // Solid background
                : 'rgba(249, 250, 251, 0.4)',
              borderColor: getColorWithOpacity(currentColor, 0.15) 
            }}
          >
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: getColorWithOpacity(currentColor, 0.15) }}
            >
              <FaCog style={{ color: currentColor }} />
            </div>
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Manage Profile
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Update your green account settings
              </p>
            </div>
          </div>
        )}

        {/* Green Science Info */}
        <div 
          className="p-3 rounded-xl mb-4 border"
          style={{ 
            backgroundColor: isDark 
              ? 'rgba(55, 65, 81, 0.4)' // Solid background
              : 'rgba(249, 250, 251, 0.4)',
            borderColor: getColorWithOpacity(currentColor, 0.15)
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaLeaf 
              className="text-sm animate-pulse" 
              style={{ color: currentColor }} 
            />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Green Science Activity
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {user?.role === 'siswa' && "Keep learning green science for a sustainable future! 🌱"}
            {user?.role === 'guru' && "Thank you for teaching sustainable science! 🌿"}
            {user?.role === 'admin' && "Managing the green learning ecosystem! 🌍"}
            {!user && "Welcome to GreenSys! 🌿"}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <FaSignOutAlt />
          <span>Keluar dari GreenSys</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;