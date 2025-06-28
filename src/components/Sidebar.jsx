import React from 'react'
import { useSelector } from "react-redux";
import { Link, NavLink } from 'react-router-dom'
import { MdOutlineCancel, MdScience, MdEco } from 'react-icons/md'
import { FaLeaf, FaUsers, FaCertificate, FaChalkboardTeacher, FaBook, FaPencilAlt, FaLock, FaRecycle, FaSeedling, FaGraduationCap } from 'react-icons/fa';
import { BiSolidDashboard } from 'react-icons/bi';
import { BsDoorOpen } from 'react-icons/bs';
import { GiPlantSeed } from 'react-icons/gi';

import LogoSMA from "../assets/Logo1.png";
import { useStateContext } from '../contexts/ContextProvider'

const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize, currentColor, currentMode } = useStateContext()
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || 'siswa';

  // Helper function for colors with opacity
  const getColorWithOpacity = (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Green Science themed links configuration
  const allLinks = [
    {
      title: 'Dashboard',
      links: [
        {
          name: 'dashboard',
          displayName: 'Dashboard GreenSys',
          icon: <BiSolidDashboard />,
          allowedRoles: ['admin', 'guru', 'siswa'],
        },
      ],
    },
  
    {
      title: 'Green Learning',
      links: [
        {
          name: 'siswa',
          displayName: 'Green Learners',
          icon: <FaGraduationCap />,
          allowedRoles: ['admin', 'guru'],
        },
        {
          name: 'guru',
          displayName: 'Green Educators',
          icon: <FaChalkboardTeacher />,
          allowedRoles: ['admin'],
        },
        {
          name: 'kelas',
          displayName: 'Eco Classroom',
          icon: <BsDoorOpen />,
          allowedRoles: ['admin', 'guru'],
        },
        {
          name: 'quiz',
          displayName: 'Green Quiz',
          icon: <FaPencilAlt />,
          allowedRoles: ['siswa'],
        },
        {
          name: 'nilai',
          displayName: 'Eco Assessment',
          icon: <FaLeaf />,
          allowedRoles: ['admin', 'guru'],
        },
        {
          name: 'nilai-saya',
          displayName: 'My Green Score',
          icon: <FaSeedling />,
          allowedRoles: ['siswa'],
        },
        {
          name: 'modul-belajar',
          displayName: 'Eco Learning Module',
          icon: <FaBook />,
          allowedRoles: ['admin', 'guru', 'siswa'],
        },
        {
          name: 'data-soal',
          displayName: 'Green Question Bank',
          icon: <FaRecycle />,
          allowedRoles: ['admin', 'guru'],
        },
        {
          name: 'certificate',
          displayName: 'Certificate Leaners',
          icon: <FaCertificate />,
          allowedRoles: ['admin', 'guru', 'siswa'],
        },
      ],
    },
    {
      title: 'System Settings',
      links: [
        {
          name: 'ganti-password',
          displayName: 'Change Password',
          icon: <FaLock />,
          allowedRoles: ['admin', 'guru', 'siswa'],
        },
        {
          name: 'users',
          displayName: 'User Management',
          icon: <FaUsers />,
          allowedRoles: ['admin'],
        },
      ],
    },
  ];

  // Filter links based on user role
  const filterLinksByRole = (links, role) => {
    const filteredCategories = links.map(category => {
      const filteredLinks = category.links.filter(link => 
        link.allowedRoles.includes(role)
      );
      
      return {
        ...category,
        links: filteredLinks
      };
    });
    
    return filteredCategories.filter(category => category.links.length > 0);
  };

  const links = filterLinksByRole(allLinks, userRole);

  const handleCloseSideBar = () => {
    if(activeMenu && screenSize <= 900){
      setActiveMenu(false)
    }
  }

  // Dynamic link styles using currentColor and currentMode
  const activeLink = `flex items-center gap-3 pl-4 pt-3 pb-3 rounded-xl text-white text-sm m-2 font-medium shadow-lg transform scale-105 transition-all duration-300`;
  
  const normalLink = `flex items-center gap-3 pl-4 pt-3 pb-3 rounded-xl text-sm m-2 transition-all duration-300 hover:scale-102 ${
    currentMode === 'Dark' 
      ? 'text-gray-200' 
      : 'text-gray-700'
  }`;

  return (
    <div 
      className={`ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 ${
        currentMode === 'Dark' ? 'bg-gray-800' : 'bg-white'
      }`}
      style={{ 
        borderRight: `1px solid ${getColorWithOpacity(currentColor, 0.2)}` 
      }}
    >
      {activeMenu && (<>
        {/* Header Section */}
        <div 
          className="flex justify-between items-center pb-4"
          style={{ 
            borderBottom: `1px solid ${getColorWithOpacity(currentColor, 0.2)}` 
          }}
        >
          <Link 
            to="/dashboard" 
            onClick={handleCloseSideBar} 
            className={`items-center gap-3 ml-3 mt-4 flex text-lg font-bold tracking-tight transition-colors duration-300 ${
              currentMode === 'Dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            <div>
              <div className="flex items-center gap-1">
                <span style={{ color: currentColor }}>Green</span>
                <span>Sys</span>
                <MdScience 
                  className="text-sm" 
                  style={{ color: currentColor }}
                />
              </div>
            </div>
          </Link>
          
          <button 
            type='button' 
            onClick={() => setActiveMenu((prevActiveMenu) => !prevActiveMenu)} 
            className={`text-xl rounded-full p-2 mt-4 mr-3 block md:hidden transition-colors duration-300 ${
              currentMode === 'Dark' 
                ? 'text-gray-300 hover:bg-gray-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MdOutlineCancel />
          </button>
        </div>

        {/* Navigation Links */}
        <div className='mt-6 px-2'>
          {links.map((item) => (
            <div key={item.title} className="mb-6">
              {/* Section Header */}
              <div className="flex items-center gap-2 mx-2 mb-3">
                <div 
                  className="w-1 h-4 rounded-full"
                  style={{ backgroundColor: currentColor }}
                ></div>
                <p 
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {item.title}
                </p>
                {item.title === 'Green Learning' && (
                  <FaLeaf 
                    className="text-xs animate-pulse" 
                    style={{ color: currentColor }}
                  />
                )}
                {item.title === 'System Settings' && (
                  <MdEco 
                    className="text-xs" 
                    style={{ color: currentColor }}
                  />
                )}
              </div>
              
              {/* Navigation Items */}
              {item.links.map((link) => (
                <NavLink 
                  to={`/${link.name}`} 
                  key={link.name} 
                  onClick={handleCloseSideBar} 
                  className={({ isActive }) => 
                    isActive ? activeLink : normalLink
                  }
                  style={({ isActive }) => 
                    isActive 
                      ? { 
                          backgroundColor: currentColor,
                          background: `linear-gradient(135deg, ${currentColor} 0%, ${getColorWithOpacity(currentColor, 0.8)} 100%)`
                        }
                      : {}
                  }
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('text-white')) {
                      e.currentTarget.style.backgroundColor = getColorWithOpacity(currentColor, 0.1);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('text-white')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className='capitalize font-medium'>{link.displayName}</span>
                  
                  {/* Special indicators */}
                  {link.name === 'quiz' && (
                    <GiPlantSeed 
                      className="ml-auto text-sm animate-bounce" 
                      style={{ color: currentColor }}
                    />
                  )}
                  {link.name === 'modul-belajar' && (
                    <FaLeaf 
                      className="ml-auto text-sm animate-pulse" 
                      style={{ color: currentColor }}
                    />
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Section (Optional) */}
        <div 
          className="mt-auto mx-4 mb-4 p-3 rounded-xl"
          style={{ 
            backgroundColor: getColorWithOpacity(currentColor, 0.1),
            border: `1px solid ${getColorWithOpacity(currentColor, 0.2)}`
          }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: currentColor }}
            >
              <MdEco className="text-white text-sm" />
            </div>
            <div>
              <p 
                className={`text-xs font-semibold ${
                  currentMode === 'Dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Green Science
              </p>
              <p 
                className={`text-xs ${
                  currentMode === 'Dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Berkelanjutan & Ramah Lingkungan
              </p>
            </div>
          </div>
        </div>
      </>)}
    </div>
  )
}

export default Sidebar