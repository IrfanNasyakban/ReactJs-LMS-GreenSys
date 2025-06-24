import React from "react";
import Navbar from "./Navbar/Navbar";
import NavbarBanner from "./Navbar/NavbarBanner";
import Hero from "./Hero/Hero";
import About from "./About/About";
import Footer from "./Footer/Footer";
import "./homepage.css";

const Homepage = () => {
  return (
    <main className="overflow-x-hidden font-homepage bg-nature-pattern">
      {/* Navigation */}
      <NavbarBanner />
      <Navbar />
      
      {/* Main Content */}
      <Hero />

      {/* About Content */}
      <About />
      
      {/* Additional Green Science Features Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Fitur <span className="green-text-gradient">GreenSys</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform pembelajaran IPA terintegrasi dengan prinsip green economy dan pengolahan limbah organik
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="green-card green-card-hover text-center">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Pembelajaran Interaktif</h3>
              <p className="text-gray-600">
                Modul pembelajaran IPA yang terintegrasi dengan praktik green economy dan pengelolaan limbah organik
              </p>
            </div>
            
            <div className="green-card green-card-hover text-center">
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Bank Soal Ramah Lingkungan</h3>
              <p className="text-gray-600">
                Kumpulan soal-soal IPA yang berfokus pada tema lingkungan dan keberlanjutan
              </p>
            </div>
            
            <div className="green-card green-card-hover text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Evaluasi Berkelanjutan</h3>
              <p className="text-gray-600">
                Sistem evaluasi yang mengukur pemahaman siswa tentang konsep green science dan literasi sains
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Homepage;