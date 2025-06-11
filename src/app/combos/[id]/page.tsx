'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingCart, Package, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { toast } from 'react-toastify';
import VoucherSection from '@/components/ui/VoucherSection';

interface ComboItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    images: Array<{
      url: string;
      alt?: string;
    }>;
    category: {
      name: string;
    };
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
  discount?: number;
  isActive: boolean;
  category: {
    name: string;
  };
  createdAt: string;
}

export default function ComboDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addComboToCart } = useCart();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCombo(params.id as string);
    }
  }, [params.id]);

  const fetchCombo = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/combos/${id}`);
      
      if (!response.ok) {
        throw new Error('Combo không tồn tại');
      }
      
      const data = await response.json();
      setCombo(data.combo || data);
    } catch (error) {
      console.error('Error fetching combo:', error);
      setError('Không thể tải thông tin combo');
      toast.error('Không thể tải thông tin combo');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  const calculateSavings = () => {
    if (!combo || !combo.originalPrice) return 0;
    const original = parseFloat(combo.originalPrice);
    const current = parseFloat(combo.price);
    return original - current;
  };

  const handleAddToCart = () => {
    if (!combo) return;
    
    try {
      const comboWithQuantity = {
        ...combo,
        price: parseFloat(combo.price),
        originalPrice: combo.originalPrice ? parseFloat(combo.originalPrice) : undefined,
        quantity
      };
      
      for (let i = 0; i < quantity; i++) {
        addComboToCart(comboWithQuantity);
      }
      
      toast.success(`Đã thêm ${quantity} combo "${combo.name}" vào giỏ hàng!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !combo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Combo không tồn tại</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={combo.images?.[selectedImageIndex]?.url || '/placeholder-food.svg'}
                alt={combo.images?.[selectedImageIndex]?.alt || combo.name}
                fill
                className="object-cover"
                priority
              />
              {/* Combo Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Combo
                </span>
              </div>
              {/* Discount Badge */}
              {combo.discount && combo.discount > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    -{combo.discount}%
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {combo.images && combo.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {combo.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || combo.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Package className="w-4 h-4" />
              <span>{combo.category?.name}</span>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                {combo.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(combo.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>                <span className="text-sm text-gray-700">
                  ({combo.totalReviews} đánh giá)
                </span>
              </div>
            </div>            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed">
                {combo.description}
              </p>
            </div>

            {/* Combo Items */}
            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                Combo này bao gồm ({combo.items?.length || 0} món):
              </h3>
              <div className="space-y-3">
                {combo.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.url || '/placeholder-food.svg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>                      <p className="text-sm text-gray-700">
                        {item.product.category?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-orange-600">
                        x{item.quantity}
                      </span>                      <span className="text-sm text-gray-700">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                  {formatPrice(combo.price)}
                </span>
                {combo.originalPrice && (
                  <div className="text-right">
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(combo.originalPrice)}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Tiết kiệm {formatPrice(calculateSavings())}
                    </div>
                  </div>
                )}
              </div>              {/* Quantity Selector */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-medium text-gray-900">Số lượng:</span>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-md bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold text-lg text-gray-900 px-2">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className="w-8 h-8 rounded-md bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`w-14 h-14 rounded-xl border transition-all flex items-center justify-center ${
                    isFavorited
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-red-200 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="font-semibold text-green-700">Giao hàng</div>
                <div className="text-green-600">30-45 phút</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="font-semibold text-blue-700">Miễn phí ship</div>
                <div className="text-blue-600">Đơn từ 200k</div>
              </div>
            </div>            {/* Voucher Section */}
            <div className="pt-6 border-t border-gray-200">
              <VoucherSection 
                currentTotal={parseFloat(combo.price) * quantity}
                redirectToCheckout={true}
              />
            </div>
          </div>
        </div>

        {/* Related Combos */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Combo khác bạn có thể thích</h2>
          <div className="text-center">
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Xem thêm combo khác
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
