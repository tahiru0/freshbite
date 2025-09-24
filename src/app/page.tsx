'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroBanner } from "@/components/layout/HeroBanner";
import { ProductCard } from "@/components/ui/ProductCard";
import { ComboCard } from "@/components/ui/ComboCard";
import { CategorySkeleton, ProductSkeleton, ComboSkeleton } from "@/components/ui/Skeletons";
import { Star, Truck, Shield, Headphones, Leaf } from "lucide-react";
import { useCart } from '@/components/context/CartContext';
import { toast } from 'react-toastify';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  _count: {
    products: number;
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
  items: Array<{
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
  }>;
  averageRating: number;
  totalReviews: number;
  discount?: number;
  createdAt: string;
}

const features = [
  {
    icon: Leaf,
    title: "100% Tự Nhiên",
    description: "Tất cả sản phẩm đều từ nguyên liệu organic tự nhiên"
  },
  {
    icon: Truck,
    title: "Giao Hàng Nhanh",
    description: "Giao hàng trong 30 phút tại TP.HCM"
  },
  {
    icon: Shield,
    title: "An Toàn Chất Lượng",
    description: "Cam kết chất lượng và an toàn thực phẩm"
  },
  {
    icon: Headphones,
    title: "Hỗ Trợ 24/7",
    description: "Đội ngũ chăm sóc khách hàng chuyên nghiệp"
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredCombos, setFeaturedCombos] = useState<Combo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const { addToCart, addComboToCart } = useCart();

  // Check for order success message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderSuccess = urlParams.get('orderSuccess');
    if (orderSuccess) {
      toast.success(`🎉 Đặt hàng thành công! Mã đơn hàng: ${orderSuccess}`, {
        position: "top-center",
        autoClose: 5000,
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Load categories first
      setLoadingCategories(true);
      const categoriesResponse = await fetch('/api/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.status);
        setCategories([]);
      }
      setLoadingCategories(false);

      // Small delay before loading products
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load products
      setLoadingProducts(true);
      const productsResponse = await fetch('/api/products?limit=6');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setFeaturedProducts(productsData.products || []);
      } else {
        console.error('Failed to fetch products:', productsResponse.status);
        setFeaturedProducts([]);
      }
      setLoadingProducts(false);

      // Small delay before loading combos
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load combos
      setLoadingCombos(true);
      const combosResponse = await fetch('/api/combos?limit=6');
      if (combosResponse.ok) {
        const combosData = await combosResponse.json();
        setFeaturedCombos(combosData.combos || []);
      } else {
        console.error('Failed to fetch combos:', combosResponse.status);
        setFeaturedCombos([]);
      }
      setLoadingCombos(false);

    } catch (error) {
      console.error('Error fetching data:', error);
      setCategories([]);
      setFeaturedProducts([]);
      setFeaturedCombos([]);
      setLoadingCategories(false);
      setLoadingProducts(false);
      setLoadingCombos(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      // Tìm product trong danh sách để thêm vào cart context
      const product = featuredProducts.find(p => p.id === productId);
      if (product) {
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || '/placeholder-food.svg',
          productId: product.id,
          type: 'product' as const
        };
        addToCart(cartItem);
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }

      // Thử gọi API nếu user đã đăng nhập (optional)
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Thêm token nếu user đã đăng nhập
            // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            quantity: 1
          })
        });

        if (response.ok) {
          console.log('Added to server cart successfully');
        } else {
          console.log('Failed to add to server cart (user may not be logged in)');
        }
      } catch (apiError) {
        console.log('API call failed (user may not be logged in):', apiError);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleAddComboToCart = async (comboId: string) => {
    try {
      // Tìm combo trong danh sách để thêm vào cart context
      const combo = featuredCombos.find(c => c.id === comboId);
      if (combo) {
        addComboToCart(combo);
        toast.success(`Đã thêm combo "${combo.name}" vào giỏ hàng!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Thử gọi API nếu user đã đăng nhập (optional)
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Thêm token nếu user đã đăng nhập
            // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            comboId,
            quantity: 1
          })
        });

        if (response.ok) {
          console.log('Added combo to server cart successfully');
        } else {
          console.log('Failed to add combo to server cart (user may not be logged in)');
        }
      } catch (apiError) {
        console.log('API call failed (user may not be logged in):', apiError);
      }
    } catch (error) {
      console.error('Error adding combo to cart:', error);
      toast.error('Có lỗi xảy ra khi thêm combo vào giỏ hàng');
    }
  };

  if (loading && loadingCategories && loadingProducts && loadingCombos) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Banner Skeleton */}
        <div className="relative h-96 bg-gradient-to-r from-green-400 to-green-600 animate-pulse">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <div className="h-12 bg-white bg-opacity-20 rounded mb-4"></div>
                <div className="h-6 bg-white bg-opacity-20 rounded mb-2"></div>
                <div className="h-6 bg-white bg-opacity-20 rounded w-3/4 mb-8"></div>
                <div className="flex gap-4">
                  <div className="h-12 bg-white bg-opacity-30 rounded-lg w-32"></div>
                  <div className="h-12 bg-white bg-opacity-20 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section Skeleton */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2">
                {[...Array(6)].map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Products Section Skeleton */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 bg-gray-200 rounded w-40"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Combos Section Skeleton */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ComboSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories Section - Horizontal Scroll */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Danh Mục</h2>
            <Link href="/categories" className="text-green-600 hover:text-green-700 font-medium text-sm">
              Xem tất cả →
            </Link>
          </div>
          
          {/* Horizontal scroll container */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
              {loadingCategories ? (
                [...Array(6)].map((_, i) => (
                  <CategorySkeleton key={i} />
                ))
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex-shrink-0">
                    <Link href={`/categories/${category.id}`}>
                      <div className="bg-gray-50 hover:bg-green-50 rounded-xl p-4 transition-all duration-200 cursor-pointer border hover:border-green-200 w-48">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {category.image ? (
                              <Image 
                                src={category.image} 
                                alt={category.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling!.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span className={`text-2xl ${category.image ? 'hidden' : ''}`}>🥗</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {category.name}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {category._count.products} món
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Những sản phẩm được yêu thích nhất với chất lượng tuyệt vời và giá trị dinh dưỡng cao
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loadingProducts ? (
              [...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))
            )}
          </div>
          <div className="text-center mt-16">
            <button className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
              Xem Tất Cả Sản Phẩm
            </button>
          </div>
        </div>
      </section>

      {/* Featured Combos Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Combo Tiết Kiệm</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Các combo được thiết kế đặc biệt giúp bạn tiết kiệm chi phí và có bữa ăn đầy đủ dinh dưỡng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingCombos ? (
              [...Array(6)].map((_, i) => (
                <ComboSkeleton key={i} />
              ))
            ) : (
              featuredCombos.map((combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  onAddToCart={handleAddComboToCart}
                />
              ))
            )}
          </div>
          <div className="text-center mt-16">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
              Xem Tất Cả Combo
            </button>
          </div>
        </div>
      </section>

      {/* More Products by Category */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Khám Phá Thêm</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Thực đơn đa dạng với hàng trăm món ăn healthy được chế biến từ nguyên liệu tự nhiên
            </p>
          </div>
          
          {/* Grid showcasing variety */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left column - Large featured item */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Menu Đặc Biệt Hôm Nay</h3>
                <p className="text-green-100 mb-6">
                  Combo salad + sinh tố detox + nước ép tươi với giá ưu đãi
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold">299.000₫</span>
                    <span className="text-green-200 line-through ml-2">359.000₫</span>
                  </div>
                  <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Đặt Ngay
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right column - Stats/Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                <p className="text-gray-600">Món ăn healthy</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="text-3xl font-bold text-orange-500 mb-2">30&apos;</div>
                <p className="text-gray-600">Giao hàng nhanh</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="text-3xl font-bold text-blue-500 mb-2">5⭐</div>
                <p className="text-gray-600">Đánh giá khách hàng</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md">
                <div className="text-3xl font-bold text-purple-500 mb-2">24/7</div>
                <p className="text-gray-600">Tư vấn dinh dưỡng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Đăng Ký Nhận Ưu Đãi
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Nhận thông tin về món ăn mới, chương trình khuyến mãi và mẹo giao hàng từ FreshBite
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
              Đăng Ký
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Moved down */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại Sao Chọn FreshBite?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến những bữa ăn tươi ngon và dịch vụ giao hàng tốt nhất cho bạn
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Khách Hàng Nói Gì</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những phản hồi tích cực từ khách hàng đã trải nghiệm sản phẩm của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  &ldquo;Sản phẩm rất tươi ngon và giàu dinh dưỡng. Tôi đã cảm thấy sức khỏe tốt hơn rất nhiều kể từ khi sử dụng.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Nguyễn Thị Lan</p>
                    <p className="text-sm text-gray-600">Khách hàng thường xuyên</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
