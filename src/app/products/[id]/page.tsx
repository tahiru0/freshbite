'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Plus, Minus, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { toast } from 'react-toastify';
import VoucherSection from '@/components/ui/VoucherSection';

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
  category: {
    id: string;
    name: string;
  };
  nutritionInfo?: string;
  ingredients?: string;
  allergens?: string;
  storage?: string;
  benefits?: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          // Fix: API returns data.product, not just data
          const productData = data.product;
          // Fix: Convert price string to number
          if (productData) {
            productData.price = parseFloat(productData.price);
            setProduct(productData);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?productId=${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (params.id) {
      fetchProduct();
      fetchReviews();
    }
  }, [params.id]);  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || '/placeholder-food.jpg',
          productId: product.id,
          type: 'product'
        });      }
      // Show success message with toast
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h2>
          <Link href="/products" className="text-green-600 hover:text-green-700">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="text-sm sm:text-base">Quay lại sản phẩm</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images?.[selectedImageIndex]?.url || '/placeholder-food.jpg'}
                  alt={product.images?.[selectedImageIndex]?.alt || product.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-food.jpg';
                  }}
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-green-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-food.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Category & Title */}
              <div>
                {product.category && (
                  <Link
                    href={`/categories/${product.category.id}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.round(product.averageRating || 0))}                  <span className="text-sm text-gray-700 ml-2">
                    {(product.averageRating || 0).toFixed(1)} ({product.totalReviews || 0} đánh giá)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {formatPrice(product.price)}
              </div>              {/* Description */}
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{product.description}</p>              {/* Benefits */}
              {product.benefits && Array.isArray(product.benefits) && product.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lợi ích:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {product.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">Số lượng:</span>
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-md bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center font-semibold text-lg text-gray-900 px-2">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-md bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                  
                  <div className="flex space-x-3 sm:space-x-4">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`p-3 rounded-lg border transition-colors ${
                        isWishlisted
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button className="p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Giao hàng nhanh</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Đảm bảo chất lượng</span>
                </div>
              </div>              {/* Voucher Section */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200">
                <VoucherSection 
                  currentTotal={product.price * quantity}
                  redirectToCheckout={true}
                />
              </div>
            </div>
          </div>          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 lg:px-8 overflow-x-auto">
              {['description', 'nutrition', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >                  {tab === 'description' && 'Mô tả'}
                  {tab === 'nutrition' && 'Thông tin dinh dưỡng'}
                  {tab === 'reviews' && `Đánh giá (${reviews.length})`}
                </button>
              ))}
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    {product.ingredients && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Thành phần:</h4>
                      <p className="text-gray-700">{product.ingredients}</p>
                    </div>
                  )}
                  
                  {product.storage && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Bảo quản:</h4>
                      <p className="text-gray-700">{product.storage}</p>
                    </div>
                  )}
                  
                  {product.allergens && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Chất gây dị ứng:</h4>
                      <p className="text-gray-700">{product.allergens}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div>
                  {product.nutritionInfo ? (
                    <p className="text-gray-700">{product.nutritionInfo}</p>
                  ) : (
                    <p className="text-gray-500">Thông tin dinh dưỡng sẽ được cập nhật sớm.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="font-medium text-gray-900">{review.user.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}