'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Package } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  loading = 'lazy',
  fallbackIcon,
  onLoad,
  onError,
  sizes
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      onError?.();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };
  const getImageSrc = () => {
    if (imageError || !src) return '/placeholder-food.jpg';
    return src;
  };

  // Fallback component when image fails
  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${fill ? 'absolute inset-0' : ''} ${className}`}>
        {fallbackIcon || (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Package className="w-8 h-8 mb-1" />
            <span className="text-xs">Không có ảnh</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={fill ? 'relative w-full h-full' : 'relative'}>
      {!imageLoaded && (
        <div 
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${fill ? 'absolute inset-0' : className}`}
          style={fill ? {} : { width, height }}
        >
          {fallbackIcon || <Package className="w-8 h-8 text-gray-400" />}
        </div>
      )}
      <Image
        src={getImageSrc()}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
        loading={loading}
        unoptimized={imageError}
        {...(sizes && { sizes })}
      />
    </div>
  );
}
