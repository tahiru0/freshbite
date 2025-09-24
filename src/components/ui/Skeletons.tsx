import React from 'react';

export const CategorySkeleton = () => (
  <div className="flex-shrink-0 animate-pulse">
    <div className="bg-gray-50 rounded-xl p-4 border w-48">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-5">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
          ))}
        </div>
        <div className="h-3 bg-gray-200 rounded w-8"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ComboSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-5">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
          ))}
        </div>
        <div className="h-3 bg-gray-200 rounded w-8"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);