import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaYoutube, FaStar, FaUsers, FaVideo, FaCheck } from 'react-icons/fa';

// Professional VideoPlayer Component
const VideoPlayer = memo(({ 
  videoId, 
  title, 
  thumbnailUrl, 
  isMain = false, 
  delay = 0, 
  videoKey,
  channelInfo = null,
  isPlaying,
  onPlay
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`relative ${isMain ? 'flex-1' : 'w-full sm:w-52 md:w-56 lg:w-64'}`} // Adjust width for responsiveness
    >
      <div className="backdrop-blur-xl rounded-2xl overflow-hidden border border-green-600/50 relative shadow-2xl hover:shadow-green-400/20 transition-all duration-500 group">
        {!isPlaying ? (
          <div className="relative">
            {/* Video container with proper aspect ratio */}
            <div className='relative aspect-[9/16] w-full'>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat cursor-pointer"
                style={{
                  backgroundImage: `url(${thumbnailUrl})`
                }}
                onClick={onPlay}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full flex items-center justify-center transform transition-all duration-300 cursor-pointer shadow-2xl ${
                      isMain ? 'w-20 h-20' : 'w-14 h-14'
                    }`}
                    role="button"
                    aria-label="Play Video"
                    tabIndex="0"
                    onClick={onPlay}
                  >
                    <FaPlay className={`text-white ${isMain ? 'text-2xl' : 'text-lg'} ml-1`} />
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Video info overlay */}
            <div className={`absolute ${isMain ? 'bottom-0 left-0 right-0 p-6' : 'bottom-0 left-0 right-0 p-4'}`}>
              <div className="space-y-2">
                <h3 className={`text-white font-semibold ${isMain ? 'text-lg leading-tight' : 'text-sm leading-tight'} line-clamp-2`}>
                  {title}
                </h3>
              </div>
            </div>
          </div>
        ) : (
          <div className='aspect-[9/16] w-full'>
            <iframe
              key={`video-${videoKey}-${videoId}`}
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=0&cc_load_policy=0&enablejsapi=1`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>
    </motion.div>
  );
});

const About = () => {
  const [playingVideos, setPlayingVideos] = useState({
    main: false,
    video1: false,
    video2: false
  });

  const handlePlayVideo = useCallback((videoKey) => {
    setPlayingVideos(prev => ({
      ...prev,
      [videoKey]: true
    }));
  }, []);

  const handlePlayMain = useCallback(() => handlePlayVideo('main'), [handlePlayVideo]);
  const handlePlayVideo1 = useCallback(() => handlePlayVideo('video1'), [handlePlayVideo]);
  const handlePlayVideo2 = useCallback(() => handlePlayVideo('video2'), [handlePlayVideo]);

  return (
    <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 py-8 relative overflow-hidden min-h-screen">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Geometric patterns */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-green-600/10 rounded-full blur-xl animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-400/20 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        
        {/* Floating icons */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 right-20 text-4xl text-green-300/30"
        >
          <FaYoutube />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 left-16 text-3xl text-emerald-300/30"
        >
          <FaPlay />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                  Revolusi{' '}
                  <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                    Literasi Sains
                  </span>{' '}
                  dengan GreenSys
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl text-green-100 leading-relaxed"
              >
                Bergabunglah dengan <span className="text-green-200 font-semibold">1,084+</span> siswa 
                yang telah merasakan pengalaman belajar IPA terintegrasi <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent font-semibold">Green Economy</span> melalui 
                platform pembelajaran berkelanjutan kami.
              </motion.p>
            </div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center shadow-xl hover:shadow-green-400/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <FaUsers className="text-green-300 text-xl" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">1,084+</div>
                <div className="text-green-100 text-sm font-medium">Siswa Aktif</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center shadow-xl hover:shadow-emerald-400/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <FaVideo className="text-emerald-300 text-xl" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">76+</div>
                <div className="text-green-100 text-sm font-medium">Guru IPA</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center shadow-xl hover:shadow-green-300/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-3">
                  <FaStar className="text-green-200 text-xl" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-200 to-green-400 bg-clip-text text-transparent">31+</div>
                <div className="text-green-100 text-sm font-medium">Rombel</div>
              </motion.div>
            </motion.div>

            {/* Enhanced Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-green-300 to-emerald-400 p-3 rounded-xl">
                  <FaPlay className="text-green-800 text-xl" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Testimoni Pembelajaran Berkelanjutan</h3>
                  <p className="text-green-100 leading-relaxed">
                    Saksikan bagaimana GreenSys mengubah cara siswa memahami sains melalui 
                    praktik pengolahan limbah organik dan penerapan konsep Green Economy dalam pembelajaran.
                  </p>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-1">
                      <FaCheck className="text-green-300 text-sm" />
                      <span className="text-green-200 text-sm">Eco-friendly learning</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaCheck className="text-green-300 text-sm" />
                      <span className="text-green-200 text-sm">Verified impact</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Enhanced Videos */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-8 items-start flex-wrap"
          >
            {/* Main Video (Left) */}
            <VideoPlayer 
              videoId="WfcPyvLwajI"
              title="Pembelajaran IPA Berkelanjutan - Testimoni Siswa GreenSys"
              thumbnailUrl="https://videolabs.id/wp-content/uploads/2024/01/IMG_2176.jpg"
              isMain={true}
              delay={0.4}
              videoKey="main"
              channelInfo="GreenSys Official"
              isPlaying={playingVideos.main}
              onPlay={handlePlayMain}
            />

            {/* Videos Stack (Right) */}
            <div className="flex flex-col gap-8 w-full md:w-auto">
              <VideoPlayer 
                videoId="_Zh8TfEu0_w"
                title="Green Economy dalam Praktik - Pengelolaan Limbah Organik"
                thumbnailUrl="https://videolabs.id/wp-content/uploads/2024/01/IMG_2178.jpg"
                delay={0.6}
                videoKey="video1"
                channelInfo="Eco Learning"
                isPlaying={playingVideos.video1}
                onPlay={handlePlayVideo1}
              />
              
              <VideoPlayer 
                videoId="k9km8DvWVQ0"
                title="Peningkatan Literasi Sains Melalui Green Learning"
                thumbnailUrl="https://videolabs.id/wp-content/uploads/2024/01/IMG_2177.jpg"
                delay={0.8}
                videoKey="video2"
                channelInfo="Science Education"
                isPlaying={playingVideos.video2}
                onPlay={handlePlayVideo2}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;
