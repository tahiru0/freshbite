'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Star, ShoppingCart, Grid, List, Package, Tag } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { toast } from 'react-toastify';

interface ComboItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
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
  price: string;
  originalPrice?: string;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  items: ComboItem[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function CombosPage() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCategories();
    fetchCombos();
    
    // Get category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/combos');
      if (response.ok) {
        const data = await response.json();
        setCombos(data.combos || []);
      } else {
        toast.error('Không thể tải danh sách combo');
      }
    } catch (error) {
      console.error('Error fetching combos:', error);
      toast.error('Lỗi khi tải combo');
    } finally {
      setLoading(false);
    }
  };
  const handleAddToCart = (combo: Combo) => {
    addToCart({
      id: combo.id,
      type: 'combo',
      comboId: combo.id,
      name: combo.name,
      price: parseFloat(combo.price),
      image: combo.images?.[0]?.url || '/placeholder-food.jpg'
    });
    toast.success(`Đã thêm combo ${combo.name} vào giỏ hàng!`);
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString('vi-VN') + 'đ';
  };

  const calculateSavings = (combo: Combo) => {
    if (!combo.originalPrice) return 0;
    return parseFloat(combo.originalPrice) - parseFloat(combo.price);
  };

  const calculateSavingsPercent = (combo: Combo) => {
    if (!combo.originalPrice) return 0;
    const savings = calculateSavings(combo);
    return Math.round((savings / parseFloat(combo.originalPrice)) * 100);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Filter and sort combos
  const filteredCombos = combos
    .filter(combo => {
      const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           combo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || combo.category.id === selectedCategory;
      return matchesSearch && matchesCategory && combo.isActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'savings':
          return calculateSavings(b) - calculateSavings(a);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCombos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCombos = filteredCombos.slice(startIndex, startIndex + itemsPerPage);

  const ComboGridView = ({ combo }: { combo: Combo }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={combo.images?.[0]?.url || '/placeholder-food.jpg'}
          alt={combo.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-food.jpg';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
            {combo.category.name}
          </span>
        </div>
        {combo.originalPrice && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{calculateSavingsPercent(combo)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {combo.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {combo.description}
        </p>
        
        <div className="flex items-center gap-1 mb-2">
          <Package className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-gray-600">
            {combo.items?.length || 0} món
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {renderStars(combo.averageRating)}
          </div>
          <span className="text-sm text-gray-600">
            ({combo.totalReviews})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(combo.price)}
            </span>
            {combo.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(combo.originalPrice)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/combos/${combo.id}`}
              className="px-3 py-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              Xem chi tiết
            </Link>
            <button
              onClick={() => handleAddToCart(combo)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ComboListView = ({ combo }: { combo: Combo }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex">
        <div className="relative w-48 h-32 flex-shrink-0">
          <Image
            src={combo.images?.[0]?.url || '/placeholder-food.jpg'}
            alt={combo.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-food.jpg';
            }}
          />
          {combo.originalPrice && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{calculateSavingsPercent(combo)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {combo.name}
            </h3>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              {combo.category.name}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2">
            {combo.description}
          </p>
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">
                {combo.items?.length || 0} món
              </span>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(combo.averageRating)}
              <span className="text-sm text-gray-600">
                ({combo.totalReviews} đánh giá)
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xl font-bold text-orange-600">
                  {formatPrice(combo.price)}
                </span>
                {combo.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(combo.originalPrice)}
                  </div>
                )}
              </div>
              {combo.originalPrice && (
                <div className="text-sm text-green-600 font-medium">
                  Tiết kiệm {formatPrice(calculateSavings(combo).toString())}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/combos/${combo.id}`}
                className="px-4 py-2 text-sm text-gray-600 hover:text-orange-600 transition-colors border border-gray-300 rounded-lg hover:border-orange-600"
              >
                Xem chi tiết
              </Link>
              <button
                onClick={() => handleAddToCart(combo)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải combo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Combo tiết kiệm
          </h1>
          <p className="text-gray-600">
            Những bộ combo hấp dẫn với giá ưu đãi đặc biệt
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm combo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="price-low">Giá thấp → cao</option>
              <option value="price-high">Giá cao → thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="savings">Tiết kiệm nhiều nhất</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {paginatedCombos.length} trong tổng số {filteredCombos.length} combo
          </p>
        </div>

        {/* Combos Grid/List */}
        {paginatedCombos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy combo
            </h3>
            <p className="text-gray-600">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
              : 'space-y-4 mb-8'
          }>
            {paginatedCombos.map(combo => (
              <div key={combo.id}>
                {viewMode === 'grid' ? (
                  <ComboGridView combo={combo} />
                ) : (
                  <ComboListView combo={combo} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  currentPage === i + 1
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
