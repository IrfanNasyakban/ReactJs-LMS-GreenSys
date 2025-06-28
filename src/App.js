import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

import { Navbar, Footer, Sidebar, ThemeSettings, PDFViewer } from "./components";
import { Dashboard, ProfileSaya, ListSiswa, EditDataSiswa, ListGuru, EditDataGuru, ListKelas, AddKelas, EditKelas, GantiPassword, ListUsers, AddUsers, AddProfileGuru, AddProfileSiswa, AddModulBelajar, ListModulBelajar, EditModulBelajar, ListSubModulBelajar, AddSubModulBelajar, EditSubModulBelajar, ViewContent, CetakSertifikat, ListCertificate, ListSoal, AddGroupSoal, EditGroupSoal, AddSoal, EditSoal, ListQuiz, StartQuiz } from "./Pages";

import { useStateContext } from "./contexts/ContextProvider";

import "./App.css";
import Homepage from "./Pages/Homepages/homepage";
import LoginPage from "./Pages/LoginPage";
import ForgetPassword from "./Pages/ForgetPassword/ForgetPassword";
import ResetPassword from "./Pages/ForgetPassword/ResetPassword";

const AppContent = () => {
  const { activeMenu, themeSettings, setThemeSettings, currentColor, currentMode } = useStateContext();
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isForgetPassword = location.pathname === "/forget-password";
  const isResetPassword = location.pathname.startsWith("/reset-password/");

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply current color as CSS custom property
    root.style.setProperty('--current-color', currentColor);
    root.style.setProperty('--primary-color', currentColor);
    root.style.setProperty('--green-primary', currentColor);
    
    // Apply theme mode classes
    if (currentMode === 'Dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply green science theme class
    root.classList.add('green-science-theme');
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentColor);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = currentColor;
      document.head.appendChild(meta);
    }
  }, [currentColor, currentMode]);

  return (
    <div className={`app-container ${currentMode === 'Dark' ? 'dark' : ''}`}>
      <div className="flex relative dark:bg-gray-900 bg-gray-50 min-h-screen">
        {/* Green Science Settings Button */}
        {!isHomepage && !isLoginPage && !isForgetPassword && !isResetPassword && (
          <div className="fixed right-4 bottom-4 z-[9999]">
            <button
              type="button"
              className="text-2xl p-4 hover:drop-shadow-xl hover:scale-110 text-white transition-all duration-300 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${currentColor}, ${currentColor}dd)`,
                borderRadius: "50%",
                border: "2px solid rgba(255, 255, 255, 0.2)"
              }}
              onClick={() => setThemeSettings(true)}
              data-tooltip-id="green-settings-tooltip"
              data-tooltip-content="Green Science Settings"
            >
              <div className="relative">
                <FiSettings className="animate-spin-slow" />
                <FaLeaf className="absolute -top-1 -right-1 text-xs animate-pulse" />
              </div>
            </button>
            <Tooltip 
              id="green-settings-tooltip" 
              place="top" 
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg"
            />
          </div>
        )}

        {/* Sidebar with Green Science Theme */}
        {!isHomepage && !isLoginPage && !isForgetPassword && !isResetPassword && activeMenu ? (
          <div 
            className="w-72 fixed sidebar transition-all duration-300 z-40"
            style={{
              background: currentMode === 'Dark' 
                ? 'rgba(31, 41, 55, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRight: `1px solid ${currentColor}20`
            }}
          >
            <Sidebar />
          </div>
        ) : !isHomepage && !isLoginPage && !isForgetPassword && !isResetPassword ? (
          <div className="w-0 transition-all duration-300">
            <Sidebar />
          </div>
        ) : null}

        {/* Main Content Area */}
        <div
          className={`min-h-screen w-full transition-all duration-300 ${
            activeMenu && !isHomepage && !isLoginPage && !isForgetPassword && !isResetPassword 
              ? "md:ml-72" 
              : "ml-0"
          }`}
          style={{
            background: currentMode === 'Dark' 
              ? 'linear-gradient(135deg, #111827, #1f2937)' 
              : 'linear-gradient(135deg, #f9fafb, #f3f4f6)'
          }}
        >
          {/* Navbar */}
          {!isHomepage && !isLoginPage && !isForgetPassword && !isResetPassword && (
            <div 
              className="sticky top-0 w-full z-30 transition-all duration-300"
              style={{
                background: currentMode === 'Dark' 
                  ? 'rgba(31, 41, 55, 0.9)' 
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${currentColor}20`
              }}
            >
              <Navbar />
            </div>
          )}

          {/* Page Content */}
          <div className="relative">
            {themeSettings && <ThemeSettings />}

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/ganti-password" element={<GantiPassword />} />
              <Route path="/profile-saya" element={<ProfileSaya />} />
              <Route path="/siswa" element={<ListSiswa />} />
              <Route path="/guru" element={<ListGuru />} />
              <Route path="/kelas" element={<ListKelas />} />
              <Route path="/kelas/tambah-kelas" element={<AddKelas />} />
              <Route path="/kelas/:id" element={<EditKelas />} />
              <Route path="/users" element={<ListUsers />} />
              <Route path="/users/tambah-users" element={<AddUsers />} />
              <Route path="/add-profile-siswa" element={<AddProfileSiswa />} />
              <Route path="/add-profile-guru" element={<AddProfileGuru />} />
              <Route path="/siswa/:id" element={<EditDataSiswa />} />
              <Route path="/guru/:id" element={<EditDataGuru />} />
              <Route path="/modul-belajar/add" element={<AddModulBelajar />} />
              <Route path="/modul-belajar" element={<ListModulBelajar />} />
              <Route path="/modul-belajar/edit/:id" element={<EditModulBelajar />} />
              <Route path="/modul-belajar/detail/:modulId" element={<ListSubModulBelajar />} />
              <Route path="/sub-modul-belajar/add/:modulId" element={<AddSubModulBelajar />} />
              <Route path="/sub-modul-belajar/edit/:id" element={<EditSubModulBelajar />} />
              <Route path="/sub-modul-belajar/view/:id" element={<ViewContent />} />
              <Route path="/cetak-sertifikat/:modulId" element={<CetakSertifikat />} />

              <Route path="/certificate" element={<ListCertificate />} />

              <Route path="/pdf-viewer" element={<PDFViewer />} />

              <Route path="/quiz" element={<ListQuiz />} />
              <Route path="/start-quiz/:groupId" element={<StartQuiz />} />
              <Route path="/data-soal" element={<ListSoal />} />
              <Route path="/soal/add-group" element={<AddGroupSoal />} />
              <Route path="/soal/edit-group/:id" element={<EditGroupSoal />} />
              <Route path="/soal/add-soal/:id" element={<AddSoal />} />
              <Route path="/soal/edit/:id" element={<EditSoal />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Uncomment these routes as needed */}
              {/* 
              <Route path="/data-soal/:id" element={<EditSoal />} />
              <Route path="/quiz" element={<ListQuiz />} />
              
              <Route path="/start-quiz-again/:id" element={<StartQuizLagi />} />
              <Route path="/hasil-quiz/:id" element={<HasilAkhir />} />
              <Route path="/nilai" element={<ListDataNilai />} />
              <Route path="/nilai-saya" element={<NilaiSaya />} />
              <Route path="/nilai-saya/:id" element={<DetailNilaiSaya />} />
              
    
              
              
              <Route path="/users/:id" element={<EditUsers />} />
              
              
              
              
              
               */}
            </Routes>
          </div>

          {/* Footer */}
          {!isHomepage && !isLoginPage && !isForgetPassword && !isResetPassword && <Footer />}
        </div>
      </div>

      {/* Global Green Science Styles */}
      <style jsx global>{`
        :root {
          --current-color: ${currentColor};
          --primary-color: ${currentColor};
          --green-primary: ${currentColor};
        }
        
        .app-container {
          --tw-bg-opacity: 1;
        }
        
        /* Custom scrollbar with current color */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${currentColor};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${currentColor}dd;
        }

        /* Animation classes */
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Green Science Theme Classes */
        .green-science-theme {
          --green-50: #f0fdf4;
          --green-100: #dcfce7;
          --green-500: #22c55e;
          --green-600: #16a34a;
          --emerald-50: #ecfdf5;
          --emerald-100: #d1fae5;
          --emerald-500: #10b981;
          --emerald-600: #059669;
        }

        /* Apply current color to common elements */
        .bg-current-color {
          background-color: ${currentColor} !important;
        }
        
        .text-current-color {
          color: ${currentColor} !important;
        }
        
        .border-current-color {
          border-color: ${currentColor} !important;
        }

        /* Button styles that use current color */
        .primary-btn {
          background: linear-gradient(135deg, ${currentColor}, ${currentColor}dd) !important;
          color: white !important;
        }

        .primary-btn:hover {
          background: linear-gradient(135deg, ${currentColor}dd, ${currentColor}bb) !important;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;