'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Heart, Package } from 'lucide-react';
import { useState } from 'react';

interface ComboItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
  };
}

interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  items: ComboItem[];
  averageRating: number;
  totalReviews: number;
  discount?: number;
  createdAt: string;
}

interface ComboCardProps {
  combo: Combo;
  onAddToCart?: (comboId: string) => void;
  layout?: 'grid' | 'list';
}

export function ComboCard({ combo, onAddToCart, layout = 'grid' }: ComboCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onAddToCart?.(combo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  const getImageSrc = () => {
    if (imageError) return '/placeholder-food.svg';
    return combo.images?.[0]?.url || '/placeholder-food.svg';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden">        <Link href={`/combos/${combo.id}`}>
          <div className="relative">
            {!imageLoaded && !imageError && (
              <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <Image
              src={getImageSrc()}
              alt={combo.images?.[0]?.alt || combo.name}
              width={300}
              height={200}
              className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={false}
              loading="lazy"
              unoptimized={imageError}
            />
          </div>
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Combo Badge */}
          <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
            <Package className="w-3 h-3" />
            Combo
          </span>
          
          {/* Discount Badge */}
          {combo.discount && combo.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{combo.discount}%
            </span>
          )}
          
          {/* New Badge */}
          {new Date(combo.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
            <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Mới
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Heart 
            className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>

        {/* Quick Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="absolute bottom-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/combos/${combo.id}`}>
          <h3 className="font-semibold text-gray-900 text-lg mb-2 hover:text-orange-600 transition-colors line-clamp-1">
            {combo.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {combo.description}
        </p>        {/* Combo Items Preview */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Bao gồm {combo.items?.length || 0} món:</p>
          <div className="flex -space-x-1 overflow-hidden">
            {combo.items?.slice(0, 3).map((item, index) => {
              const itemImageSrc = item.product.images?.[0]?.url;
              return (
                <div key={item.id} className="relative">
                  {itemImageSrc ? (
                    <Image
                      src={itemImageSrc}
                      alt={item.product.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder-food.svg') {
                          target.src = '/placeholder-food.svg';
                        }
                      }}
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                      <Package className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  )}
                </div>
              );
            })}
            {combo.items && combo.items.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{combo.items.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(combo.averageRating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({combo.totalReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(combo.price)}
            </span>
            {combo.originalPrice && combo.originalPrice > combo.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(combo.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          {isLoading ? 'Đang thêm...' : 'Thêm combo vào giỏ'}
        </button>
      </div>
    </div>
  );
}
