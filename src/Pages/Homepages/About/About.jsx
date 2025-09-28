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
      className={`relative ${isMain ? 'w-full' : 'w-full sm:w-52 md:w-56 lg:w-64'}`}
    >
      <div className="backdrop-blur-xl rounded-2xl overflow-hidden border border-green-600/50 relative shadow-2xl hover:shadow-green-400/20 transition-all duration-500 group">
        {!isPlaying ? (
          <div className="relative">
            {/* Video container with proper aspect ratio */}
            <div className={`relative ${isMain ? 'aspect-[9/16]' : 'aspect-[9/16]'} w-full`}>
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat cursor-pointer"
                style={{
                  backgroundImage: `url(${thumbnailUrl})`
                }}
                onClick={onPlay}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transform transition-all duration-300 cursor-pointer shadow-2xl border border-white/30 ${
                      isMain ? 'w-24 h-24' : 'w-14 h-14'
                    }`}
                    role="button"
                    aria-label="Play Video"
                    tabIndex="0"
                    onClick={onPlay}
                  >
                    <FaPlay className={`text-white ${isMain ? 'text-3xl' : 'text-lg'} ml-1`} />
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Video info overlay */}
            <div className={`absolute ${isMain ? 'bottom-0 left-0 right-0 p-6' : 'bottom-0 left-0 right-0 p-4'}`}>
              <div className="space-y-2">
                <h3 className={`text-white font-semibold ${isMain ? 'text-xl leading-tight' : 'text-sm leading-tight'} line-clamp-2`}>
                  {title}
                </h3>
                {isMain && channelInfo && (
                  <p className="text-green-200 text-sm opacity-90">{channelInfo}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${isMain ? 'aspect-[9/16]' : 'aspect-[9/16]'} w-full`}>
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

  // Configuration untuk video tambahan (set ke null atau undefined untuk menyembunyikan)
  const additionalVideos = [
    // Uncomment untuk menampilkan video tambahan
    // {
    //   videoId: "_Zh8TfEu0_w",
    //   title: "Green Economy dalam Praktik - Pengelolaan Limbah Organik",
    //   thumbnailUrl: "https://videolabs.id/wp-content/uploads/2024/01/IMG_2178.jpg",
    //   videoKey: "video1",
    //   channelInfo: "Eco Learning",
    //   onPlay: handlePlayVideo1,
    //   isPlaying: playingVideos.video1
    // },
    // {
    //   videoId: "k9km8DvWVQ0",
    //   title: "Peningkatan Literasi Sains Melalui Green Learning",
    //   thumbnailUrl: "https://videolabs.id/wp-content/uploads/2024/01/IMG_2177.jpg",
    //   videoKey: "video2",
    //   channelInfo: "Science Education",
    //   onPlay: handlePlayVideo2,
    //   isPlaying: playingVideos.video2
    // }
  ].filter(Boolean); // Filter out null/undefined entries

  return (
    <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 py-8 relative overflow-hidden min-h-screen font-homepage">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10">
        <div className={`grid grid-cols-1 ${additionalVideos.length > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 lg:gap-12 items-start`}>
          {/* Left Content - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={`space-y-6 lg:space-y-10 ${additionalVideos.length > 0 ? '' : 'lg:col-span-2'}`}
          >
            <div className="space-y-4 lg:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-3 lg:space-y-4"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
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
                className="text-base sm:text-lg lg:text-xl text-green-100 leading-relaxed"
              >
                Bergabunglah dengan <span className="text-green-200 font-semibold">1,084+</span> siswa 
                yang telah merasakan pengalaman belajar IPA terintegrasi <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent font-semibold">Green Economy</span> melalui 
                platform pembelajaran berkelanjutan kami.
              </motion.p>
            </div>

            {/* Enhanced Stats - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="green-card bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 text-center shadow-xl hover:shadow-green-400/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <FaUsers className="text-green-300 text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">1,084+</div>
                <div className="text-green-100 text-xs sm:text-sm font-medium">Siswa Aktif</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="green-card bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 text-center shadow-xl hover:shadow-emerald-400/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <FaVideo className="text-emerald-300 text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">76+</div>
                <div className="text-green-100 text-xs sm:text-sm font-medium">Guru IPA</div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="green-card bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/20 text-center shadow-xl hover:shadow-green-300/20 transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <FaStar className="text-green-200 text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-200 to-green-400 bg-clip-text text-transparent">31+</div>
                <div className="text-green-100 text-xs sm:text-sm font-medium">Rombel</div>
              </motion.div>
            </motion.div>

            {/* Enhanced Description - Mobile Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="green-card bg-white/10 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-xl"
            >
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="bg-gradient-to-br from-green-300 to-emerald-400 p-2 lg:p-3 rounded-lg lg:rounded-xl flex-shrink-0">
                  <FaPlay className="text-green-800 text-lg lg:text-xl" />
                </div>
                <div className="space-y-2 lg:space-y-3 min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Testimoni Pembelajaran Berkelanjutan</h3>
                  <p className="text-green-100 leading-relaxed text-sm sm:text-base">
                    Saksikan bagaimana GreenSys mengubah cara siswa memahami sains melalui 
                    praktik pengolahan limbah organik dan penerapan konsep Green Economy dalam pembelajaran.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 pt-2">
                    <div className="flex items-center space-x-1">
                      <FaCheck className="text-green-300 text-xs sm:text-sm" />
                      <span className="text-green-200 text-xs sm:text-sm">Eco-friendly learning</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaCheck className="text-green-300 text-xs sm:text-sm" />
                      <span className="text-green-200 text-xs sm:text-sm">Verified impact</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Video Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`${additionalVideos.length > 0 ? 'flex gap-8 items-start flex-wrap' : 'w-full'}`}
          >
            {/* Main Video */}
            <div className={`${additionalVideos.length > 0 ? 'flex-1' : 'w-full max-w-4xl mx-auto'}`}>
              <VideoPlayer 
                videoId="lRV-oj_a9kA"
                title="Pembelajaran IPA Berkelanjutan - Testimoni Guru GreenSys"
                thumbnailUrl="https://i.postimg.cc/mkBFsyqw/Screenshot-2025-09-28-090411.png"
                isMain={true}
                delay={0.4}
                videoKey="main"
                channelInfo="GreenSys Official"
                isPlaying={playingVideos.main}
                onPlay={handlePlayMain}
              />
            </div>

            {/* Additional Videos (if any) */}
            {additionalVideos.length > 0 && (
              <div className="flex flex-col gap-8 w-full md:w-auto">
                {additionalVideos.map((video, index) => (
                  <VideoPlayer
                    key={video.videoKey}
                    videoId={video.videoId}
                    title={video.title}
                    thumbnailUrl={video.thumbnailUrl}
                    delay={0.6 + (index * 0.2)}
                    videoKey={video.videoKey}
                    channelInfo={video.channelInfo}
                    isPlaying={video.isPlaying}
                    onPlay={video.onPlay}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About;