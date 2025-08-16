import React from "react";
import { MdMenu } from "react-icons/md";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  // Function untuk smooth scroll ke section tertentu
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Tutup mobile menu jika terbuka
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-green-100 sticky top-0 z-50"
      >
        <div className="container flex justify-between items-center py-4">
          {/* Logo section */}
          <div className="flex items-center gap-4">
            <img
              src={Logo} // ganti dengan path/logo kamu
              alt="GreenSys Logo"
              className="w-8 h-8 object-contain"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-800">
                    Green<span className="text-emerald-600">Sys</span>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-300 cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-300 cursor-pointer"
              >
                Komunitas
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-300 cursor-pointer"
              >
                Fitur GreenSys
              </button>
              <button
                onClick={() => scrollToSection("footer")}
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors duration-300 cursor-pointer"
              >
                Tentang
              </button>
            </nav>
          </div>

          {/* CTA Button section */}
          <div className="hidden lg:block">
            <button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full px-6 py-2.5 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={handleSignIn}
            >
              Masuk
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            <div className="bg-green-100 p-2 rounded-lg hover:bg-green-200 transition-colors duration-300">
              <MdMenu className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-green-100"
          >
            <div className="container py-4 space-y-4">
              <button
                onClick={() => scrollToSection("hero")}
                className="block w-full text-left text-gray-600 hover:text-emerald-600 font-medium py-2 transition-colors duration-300"
              >
                Beranda
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="block w-full text-left text-gray-600 hover:text-emerald-600 font-medium py-2 transition-colors duration-300"
              >
                Komunitas
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left text-gray-600 hover:text-emerald-600 font-medium py-2 transition-colors duration-300"
              >
                Fitur GreenSys
              </button>
              <button
                onClick={() => scrollToSection("footer")}
                className="block w-full text-left text-gray-600 hover:text-emerald-600 font-medium py-2 transition-colors duration-300"
              >
                Tentang
              </button>
              <button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full px-6 py-3 mt-4"
                onClick={handleSignIn}
              >
                Masuk
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default Navbar;
