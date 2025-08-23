"use client";
import { useState, useEffect, useRef } from 'react';

export default function DemoVideoPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scenes = [
    {
      id: 0,
      title: "Opening Hook",
      startTime: 0,
      endTime: 5,
      description: "Hookah+ - Future of Lounge Sessions with AI-Powered Personalization",
      visual: "🌿",
      overlay: "HOOKAH+"
    },
    {
      id: 1,
      title: "QR Code Scan",
      startTime: 5,
      endTime: 13,
      description: "Customer scans QR code at table to start session",
      visual: "📱",
      overlay: "SCAN TO START"
    },
    {
      id: 2,
      title: "Flavor Personalization",
      startTime: 13,
      endTime: 25,
      description: "AI-powered flavor recommendations based on preferences",
      visual: "🍃",
      overlay: "AI RECOMMENDATIONS"
    },
    {
      id: 3,
      title: "Stripe Checkout",
      startTime: 25,
      endTime: 40,
      description: "Seamless payment processing with real-time confirmation",
      visual: "💳",
      overlay: "SECURE PAYMENT"
    },
    {
      id: 4,
      title: "Confirmation Ping",
      startTime: 40,
      endTime: 48,
      description: "Instant confirmation and lounge staff notification",
      visual: "✅",
      overlay: "PAYMENT CONFIRMED"
    },
    {
      id: 5,
      title: "Lounge Dashboard",
      startTime: 48,
      endTime: 63,
      description: "Real-time session monitoring and customer insights",
      visual: "📊",
      overlay: "LIVE DASHBOARD"
    },
    {
      id: 6,
      title: "Call to Action",
      startTime: 63,
      endTime: 70,
      description: "Start transforming your lounge today",
      visual: "🚀",
      overlay: "GET STARTED"
    }
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setVideoTime(currentTime);
      
      // Update current scene based on video time
      const currentSceneIndex = scenes.findIndex(scene => 
        currentTime >= scene.startTime && currentTime < scene.endTime
      );
      
      if (currentSceneIndex !== -1 && currentSceneIndex !== currentScene) {
        setCurrentScene(currentSceneIndex);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setVideoTime(0);
      setCurrentScene(0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentScene, scenes]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setVideoTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    video.muted = newMuted;
  };

  const handleSceneClick = (sceneIndex: number) => {
    const video = videoRef.current;
    if (!video) return;

    const scene = scenes[sceneIndex];
    video.currentTime = scene.startTime;
    setCurrentScene(sceneIndex);
    setVideoTime(scene.startTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (videoTime / duration) * 100 : 0;
  };

  const currentSceneData = scenes[currentScene];

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-700 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-teal-400 mb-2">Hookah+ System Overview</h1>
          <p className="text-zinc-400 text-xl">Experience the complete Hookah+ lounge management ecosystem</p>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          {/* Video Display */}
          <div className="relative bg-black rounded-xl overflow-hidden mb-8">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[600px]"
              controls={false}
              preload="metadata"
            >
              {/* Place your MP4 file in public/assets/videos/ */}
              <source src="/assets/videos/demo-video.mp4" type="video/mp4" />
              <source src="/assets/videos/demo-video.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Video Controls Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={videoTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="text-white text-sm">
                    {formatTime(videoTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>

            {/* Scene Indicator */}
            <div className="absolute top-4 right-4 bg-black/70 rounded-lg px-3 py-2">
              <div className="text-sm text-white">
                Scene {currentScene + 1} of {scenes.length}
              </div>
            </div>
          </div>

          {/* Video Controls */}
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-zinc-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-100"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                
                <button
                  onClick={handleMuteToggle}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm">Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
              
              <div className="text-zinc-400">
                {formatTime(videoTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Interactive Demo Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-white mb-2">Live Session Management</h3>
              <p className="text-sm text-zinc-400">Real-time hookah session tracking with FOH/BOH workflow integration</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-all">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-white mb-2">QR Code Workflow</h3>
              <p className="text-sm text-zinc-400">Customer self-service from scan to payment with AI flavor recommendations</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-all">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-semibold text-white mb-2">Stripe Integration</h3>
              <p className="text-sm text-zinc-400">Seamless payment processing with real-time confirmation and staff alerts</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-zinc-400">Comprehensive insights into session performance and customer behavior</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-all">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-white mb-2">Prep Room Management</h3>
              <p className="text-sm text-zinc-400">Back-of-house workflow optimization with real-time status updates</p>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-teal-500 transition-all">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-white mb-2">ROI Calculator</h3>
              <p className="text-sm text-zinc-400">Calculate potential revenue increases and operational efficiency gains</p>
            </div>
          </div>
        </div>

        {/* System Architecture Overview */}
        <div className="mt-12 bg-zinc-800 rounded-xl p-8 border border-zinc-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">System Architecture Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Frontend Components</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-zinc-300">Fire Session Dashboard (FOH/BOH)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-zinc-300">Mobile QR Workflow Interface</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-zinc-300">Admin Control Center</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-zinc-300">ROI Calculator & Analytics</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Backend Services</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-zinc-300">Session State Machine</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-zinc-300">Stripe Payment Processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-zinc-300">Real-time Event Bus</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-zinc-300">TrustLock Security Layer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-teal-900 to-blue-900 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Hookah+?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Dive into the interactive features and see how Hookah+ transforms your lounge operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/fire-session-dashboard"
              className="bg-white text-teal-900 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              🔥 Fire Session Dashboard
            </a>
            <a
              href="/demo-flow"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              📱 QR Workflow Demo
            </a>
            <a
              href="/roi-calculator"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-900 px-8 py-4 rounded-xl text-xl font-bold transition-colors"
            >
              💰 ROI Calculator
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </main>
  );
}

