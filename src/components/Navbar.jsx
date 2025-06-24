import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../features/authSlice";

import { AiOutlineMenu } from "react-icons/ai";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown, MdScience } from "react-icons/md";
import { FaLeaf } from "react-icons/fa";

import avatar from "../data/avatar.jpg";
import { UserProfile } from ".";
import { useStateContext } from "../contexts/ContextProvider";

const NavButton = ({ title, customFunc, icon, dotColor, badge, currentColor, currentMode }) => {
  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color: currentColor }}
      className={`relative text-xl rounded-full p-3 transition-all duration-300 ${
        currentMode === 'Dark' 
          ? 'hover:bg-gray-700' 
          : 'hover:bg-gray-100'
      }`}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = getColorWithOpacity(currentColor, 0.1);
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {dotColor && (
        <span
          style={{ background: dotColor }}
          className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
        />
      )}
      {badge > 0 && (
        <span className="absolute inline-flex rounded-full h-5 w-5 right-1 top-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs justify-center items-center font-bold shadow-lg">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {icon}
    </button>
  );
};

const Navbar = () => {
  const [urlImage, setUrlImage] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setScreenSize,
    screenSize,
    currentColor,
    currentMode
  } = useStateContext();

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      if (user && user.role === "guru") {
        getProfileGuru();
      } else if (user && user.role === "siswa") {
        getProfileSiswa();
      }
    } else {
      navigate("/login");
    }
  }, [navigate, user]);

  const getProfileSiswa = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/profile-siswa`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setUrlImage(profileData.url);
      } else {
        console.error("Format data tidak sesuai:", response.data);
      }
    } catch (error) {
      console.error("Error mengambil profile siswa:", error);
    }
  };

  const getProfileGuru = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.REACT_APP_URL_API;
      const response = await axios.get(`${apiUrl}/profile-guru`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setUrlImage(profileData.url);
      } else {
        console.error("Format data tidak sesuai:", response.data);
      }
    } catch (error) {
      console.error("Error mengambil profile guru:", error);
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'siswa': return 'Green Learner';
      case 'guru': return 'Green Educator';
      case 'admin': return 'System Admin';
      default: return role;
    }
  };

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  return (
    <div 
      className={`flex justify-between items-center p-3 md:ml-6 md:mr-6 relative backdrop-blur-sm z-50 ${
        currentMode === 'Dark' ? 'bg-gray-800/80' : 'bg-white/80'
      }`}
      style={{
        borderBottom: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
      }}
    >
      {/* Menu Button */}
      <div className="flex items-center gap-4">
        <NavButton
          title="Menu"
          customFunc={handleActiveMenu}
          icon={<AiOutlineMenu />}
          currentColor={currentColor}
          currentMode={currentMode}
        />
        
        {/* Green Science Indicator */}
        <div 
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            backgroundColor: getColorWithOpacity(currentColor, 0.1),
            border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
          }}
        >
          <div 
            className="p-1 rounded-full"
            style={{ backgroundColor: currentColor }}
          >
            <MdScience className="text-white text-xs" />
          </div>
          <span className={`text-xs font-medium ${
            currentMode === 'Dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Green Science Active
          </span>
          <FaLeaf 
            className="text-xs animate-pulse" 
            style={{ color: currentColor }}
          />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 relative z-50">
        {/* Notifications */}
        <NavButton
          title="Notifications"
          customFunc={() => handleClick("notification")}
          icon={<RiNotification3Line />}
          badge={unreadCount}
          currentColor={currentColor}
          currentMode={currentMode}
        />

        {/* User Profile Dropdown */}
        <div
          className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-300 relative z-50 ${
            currentMode === 'Dark' 
              ? 'hover:bg-gray-700' 
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleClick("userProfile")}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = getColorWithOpacity(currentColor, 0.1);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div className="relative">
            <img
              className="rounded-full w-10 h-10 border-2"
              style={{ borderColor: getColorWithOpacity(currentColor, 0.3) }}
              src={urlImage && urlImage !== "http://localhost:5000/images/null" ? urlImage : avatar}
              alt="user-profile"
            />
            <div 
              className="absolute -bottom-1 -right-1 p-1 rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <FaLeaf className="text-white text-xs" />
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              <span className={`text-sm ${
                currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Hi,
              </span>
              <span className={`font-semibold text-sm ${
                currentMode === 'Dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {user ? capitalizeFirstLetter(user.username) : "Admin"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span 
                className="text-xs font-medium" 
                style={{ color: currentColor }}
              >
                {user ? getRoleDisplayName(user.role) : "System Admin"}
              </span>
              <MdScience 
                className="text-xs" 
                style={{ color: currentColor }}
              />
            </div>
          </div>
          
          <MdKeyboardArrowDown 
            className={`text-lg ${
              currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-400'
            }`}
          />
        </div>

        {isClicked.userProfile && (
          <div className="absolute top-full right-0 mt-2 z-[9999]">
            <UserProfile />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;