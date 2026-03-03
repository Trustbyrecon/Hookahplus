'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageCarousel({ images, autoPlay = true, interval = 5000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-zinc-800 flex items-center justify-center">
        <p className="text-zinc-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700">
      {/* Image Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="relative w-full h-full">
            {/* Actual Image */}
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load (e.g., authentication required)
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            
            {/* Fallback Placeholder (hidden by default, shown on image error) */}
            <div 
              className="w-full h-full bg-gradient-to-br from-teal-900/20 to-cyan-900/20 flex items-center justify-center"
              style={{ display: 'none' }}
            >
              <div className="text-center p-8">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-white mb-2">{images[currentIndex].title}</h3>
                <p className="text-zinc-300">{images[currentIndex].description}</p>
              </div>
            </div>
            
            {/* Overlay Text */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-xl font-semibold text-white mb-1">{images[currentIndex].title}</h3>
              <p className="text-sm text-zinc-300">{images[currentIndex].description}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-teal-400 w-8'
                  : 'bg-zinc-600 hover:bg-zinc-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

