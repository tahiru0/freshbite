'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  ShoppingCart, 
  Grid, 
  List, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Tag, 
  Package, 
  Heart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { toast } from 'react-toastify';
import DebouncedSearchInput from '@/components/ui/DebouncedSearchInput';
import { SafeImage } from '@/components/ui/SafeImage';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
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
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
    };
  }>;
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showType, setShowType] = useState<'all' | 'products' | 'combos'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState({
    category: true,
    type: true,
    price: true,
    rating: true
  });
  
  const itemsPerPage = 12;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCombos();
    
    // Get category from URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Memoized functions to prevent re-rendering
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        toast.error('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi khi tải sản phẩm');
    }
  }, []);

  const fetchCombos = useCallback(async () => {
    try {
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
  }, []);

  const handleAddToCartProduct = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      type: 'product',
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.images?.[0]?.url || '/placeholder-food.jpg'
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  }, [addToCart]);

  const handleAddToCartCombo = useCallback((combo: Combo) => {
    addToCart({
      id: combo.id,
      type: 'combo',
      comboId: combo.id,
      name: combo.name,
      price: parseFloat(combo.price),
      image: combo.images?.[0]?.url || '/placeholder-food.jpg'
    });
    toast.success(`Đã thêm combo ${combo.name} vào giỏ hàng!`);
  }, [addToCart]);

  const formatPrice = useCallback((price: string) => {
    return parseFloat(price).toLocaleString('vi-VN') + 'đ';
  }, []);

  const calculateSavings = useCallback((combo: Combo) => {
    if (!combo.originalPrice) return 0;
    return parseFloat(combo.originalPrice) - parseFloat(combo.price);
  }, []);

  const calculateSavingsPercent = useCallback((combo: Combo) => {
    if (!combo.originalPrice) return 0;
    const savings = calculateSavings(combo);
    return Math.round((savings / parseFloat(combo.originalPrice)) * 100);
  }, [calculateSavings]);

  const renderStars = useCallback((rating: number) => {
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
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowType('all');
    setPriceRange([0, 1000000]);
    setMinRating(0);
    setSortBy('name');
    setCurrentPage(1);
  }, []);

  const toggleFilterSection = useCallback((section: keyof typeof filtersExpanded) => {
    setFiltersExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Memoized combined items to prevent re-computation
  const allItems = useMemo(() => [
    ...products.map(p => ({ ...p, itemType: 'product' as const })),
    ...combos.map(c => ({ ...c, itemType: 'combo' as const }))
  ], [products, combos]);

  // Memoized filtered and sorted items
  const filteredItems = useMemo(() => {
    return allItems
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || item.category.id === selectedCategory;
        const matchesType = showType === 'all' || 
                           (showType === 'products' && item.itemType === 'product') ||
                           (showType === 'combos' && item.itemType === 'combo');
        const price = parseFloat(item.price);
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        const matchesRating = item.averageRating >= minRating;
        
        return matchesSearch && matchesCategory && matchesType && matchesPrice && matchesRating && item.isActive;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price-high':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'rating':
            return b.averageRating - a.averageRating;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [allItems, searchTerm, selectedCategory, showType, priceRange, minRating, sortBy]);

  // Memoized pagination
  const { totalPages, paginatedItems } = useMemo(() => {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    return { totalPages, paginatedItems };
  }, [filteredItems, currentPage, itemsPerPage]);

  // Product Card Components
  const ProductGridView = ({ item }: { item: Product & { itemType: 'product' } }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative aspect-square overflow-hidden">
        <SafeImage
          src={item.images?.[0]?.url || '/placeholder-food.jpg'}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            {item.category.name}
          </span>
        </div>
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-lg">
          {item.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {renderStars(item.averageRating)}
          </div>
          <span className="text-sm text-gray-600">
            ({item.totalReviews})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-green-600">
            {formatPrice(item.price)}
          </span>
          
          <div className="flex gap-2">
            <Link
              href={`/products/${item.id}`}
              className="px-4 py-2 text-sm text-gray-600 hover:text-green-600 transition-colors border border-gray-200 rounded-lg hover:border-green-300"
            >
              Xem
            </Link>
            <button
              onClick={() => handleAddToCartProduct(item)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ComboGridView = ({ item }: { item: Combo & { itemType: 'combo' } }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative aspect-square overflow-hidden">
        <SafeImage
          src={item.images?.[0]?.url || '/placeholder-food.jpg'}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            Combo • {item.category.name}
          </span>
        </div>
        {item.originalPrice && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              -{calculateSavingsPercent(item)}%
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-lg">
          {item.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {renderStars(item.averageRating)}
          </div>
          <span className="text-sm text-gray-600">
            ({item.totalReviews})
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(item.originalPrice)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link
              href={`/combos/${item.id}`}
              className="px-4 py-2 text-sm text-gray-600 hover:text-orange-600 transition-colors border border-gray-200 rounded-lg hover:border-orange-300"
            >
              Xem
            </Link>
            <button
              onClick={() => handleAddToCartCombo(item)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );  // Sidebar Component
  const Sidebar = () => (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white shadow-xl lg:shadow-none 
      transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 
      transition-transform duration-300 ease-in-out lg:pt-0 pt-20 flex flex-col lg:h-screen
    `}>
      <div className="p-6 border-b border-gray-200 lg:hidden flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="">
        <div className="p-6 space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Tìm kiếm
          </label>
          <DebouncedSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm sản phẩm..."
          />
        </div>

        {/* Product Type */}
        <div>
          <button
            onClick={() => toggleFilterSection('type')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span>Loại sản phẩm</span>
            {filtersExpanded.type ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {filtersExpanded.type && (
            <div className="space-y-2">
              {[
                { value: 'all', label: 'Tất cả', icon: Package },
                { value: 'products', label: 'Sản phẩm', icon: Tag },
                { value: 'combos', label: 'Combo', icon: Package }
              ].map(type => (
                <label key={type.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={showType === type.value}
                    onChange={(e) => setShowType(e.target.value as any)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <type.icon className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div>
          <button
            onClick={() => toggleFilterSection('category')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span>Danh mục</span>
            {filtersExpanded.category ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {filtersExpanded.category && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Tất cả danh mục</span>
              </label>
              {categories.map(category => (
                <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleFilterSection('price')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span>Khoảng giá</span>
            {filtersExpanded.price ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {filtersExpanded.price && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Từ</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Đến</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="1000000"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                <span>-</span>
                <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div>
          <button
            onClick={() => toggleFilterSection('rating')}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-3"
          >
            <span>Đánh giá</span>
            {filtersExpanded.rating ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {filtersExpanded.rating && (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(rating => (
                <label key={rating} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={minRating === rating}
                    onChange={(e) => setMinRating(parseInt(e.target.value))}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center space-x-1">
                    {rating === 0 ? (
                      <span className="text-sm text-gray-700">Tất cả</span>
                    ) : (
                      <>
                        {renderStars(rating)}
                        <span className="text-sm text-gray-700">trở lên</span>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-15 z-30 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Sản phẩm & Combo
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Khám phá {filteredItems.length} sản phẩm chất lượng
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="name">Tên A-Z</option>
                    <option value="price-low">Giá thấp → cao</option>
                    <option value="price-high">Giá cao → thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory || showType !== 'all' || minRating > 0 || priceRange[0] > 0 || priceRange[1] < 1000000) && (
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className="text-sm text-gray-600">Đang lọc:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tìm: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('')} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {showType !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {showType === 'products' ? 'Sản phẩm' : 'Combo'}
                    <button onClick={() => setShowType('all')} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="p-6">
            {paginatedItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 text-8xl mb-6">🍽️</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedItems.map(item => (
                  <div key={`${item.itemType}-${item.id}`}>
                    {item.itemType === 'product' ? (
                      <ProductGridView item={item as Product & { itemType: 'product' }} />
                    ) : (
                      <ComboGridView item={item as Combo & { itemType: 'combo' }} />
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
                        ? 'bg-green-600 text-white'
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
      </div>
    </div>
  );
}