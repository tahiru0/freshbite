'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  _count: {
    products: number;
  };
}

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError) return '/placeholder-category.jpg';
    return category.image || '/placeholder-category.jpg';
  };
  return (
    <Link href={`/categories/${category.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
        {/* Image Container */}
        <div className="relative overflow-hidden">          <Image
            src={getImageSrc()}
            alt={category.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            priority={false}
            loading="lazy"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
            {/* Product Count Badge */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            {category._count.products} sản phẩm
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {category.description}
          </p>
          
          {/* View More Link */}
          <div className="mt-4 flex items-center text-green-600 font-medium text-sm group-hover:text-green-700 transition-colors">
            Xem thêm
            <svg 
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
