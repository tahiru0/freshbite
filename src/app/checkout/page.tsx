'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/components/context/CartContext';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Tag, Check, X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

interface OrderData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    ward: string;
    note?: string;
  };
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
}

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  isActive: boolean;
  validFrom: string;
  validTo: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [orderData, setOrderData] = useState<OrderData>({
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    shippingAddress: {
      street: '',
      city: '',
      district: '',
      ward: '',
      note: ''
    },
    paymentMethod: 'cash'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  
  // Voucher state
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [showVoucherSection, setShowVoucherSection] = useState(false);  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // Check for user session and pre-selected voucher
  useEffect(() => {
    const checkUserAndVoucher = async () => {
      setIsLoadingUser(true);
      try {
        // Check if user is logged in
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          
          // Pre-fill form with user data
          setOrderData(prev => ({
            ...prev,
            customerInfo: {
              name: userData.user.name || '',
              email: userData.user.email || '',
              phone: userData.user.phone || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsLoadingUser(false);
      }

      // Check for pre-selected voucher from URL
      const voucherCode = searchParams.get('voucher');
      if (voucherCode) {
        setVoucherCode(voucherCode);
        // Auto-apply voucher after a short delay
        setTimeout(() => {
          applyVoucherByCode(voucherCode);
        }, 500);
      }
    };

    checkUserAndVoucher();
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const shippingFee = 30000; // 30k shipping fee
  
  // Calculate discount
  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    
    if (selectedVoucher.discountType === 'percentage') {
      const discount = (cartTotal * selectedVoucher.discountValue) / 100;
      return selectedVoucher.maxDiscountAmount 
        ? Math.min(discount, selectedVoucher.maxDiscountAmount)
        : discount;
    } else {
      return selectedVoucher.discountValue;
    }
  };
  
  const discount = calculateDiscount();
  const total = cartTotal + shippingFee - discount;
  // Fetch available vouchers (for logged in users, fetch their vouchers)
  const fetchVouchers = async () => {
    setIsLoadingVouchers(true);
    try {
      const endpoint = user ? '/api/vouchers?userVouchers=true' : '/api/vouchers';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setAvailableVouchers(data.vouchers || []);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  // Apply voucher by code (with parameter support)
  const applyVoucherByCode = async (code?: string) => {
    const voucherCodeToUse = code || voucherCode;
    if (!voucherCodeToUse.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    setIsApplyingVoucher(true);
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: voucherCodeToUse,
          orderValue: cartTotal
        }),
      });

      const data = await response.json();

      if (response.ok && data.voucher) {
        setSelectedVoucher(data.voucher);
        toast.success('Áp dụng voucher thành công!');
        setVoucherCode('');
        setShowVoucherSection(false);
      } else {
        toast.error(data.error || 'Mã voucher không hợp lệ');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi áp dụng voucher');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  // Select voucher from list
  const selectVoucher = (voucher: Voucher) => {
    // Check if voucher meets minimum order requirement
    if (voucher.minOrderValue && cartTotal < voucher.minOrderValue) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(voucher.minOrderValue)} để sử dụng voucher này`);
      return;
    }
    
    setSelectedVoucher(voucher);
    setShowVoucherSection(false);
    toast.success('Áp dụng voucher thành công!');
  };

  // Remove selected voucher
  const removeVoucher = () => {
    setSelectedVoucher(null);
    toast.info('Đã bỏ voucher');
  };

  useEffect(() => {
    if (showVoucherSection) {
      fetchVouchers();
    }
  }, [showVoucherSection]);

  const validateForm = () => {
    const newErrors: any = {};

    // Customer info validation
    if (!orderData.customerInfo.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    if (!orderData.customerInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(orderData.customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!orderData.customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(orderData.customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Address validation
    if (!orderData.shippingAddress.street.trim()) {
      newErrors.street = 'Vui lòng nhập địa chỉ';
    }
    if (!orderData.shippingAddress.ward.trim()) {
      newErrors.ward = 'Vui lòng nhập phường/xã';
    }
    if (!orderData.shippingAddress.district.trim()) {
      newErrors.district = 'Vui lòng nhập quận/huyện';
    }
    if (!orderData.shippingAddress.city.trim()) {
      newErrors.city = 'Vui lòng nhập tỉnh/thành phố';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare order data for guest checkout
      const checkoutData = {
        customerName: orderData.customerInfo.name,
        customerPhone: orderData.customerInfo.phone,
        customerEmail: orderData.customerInfo.email || null,
        customerAddress: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.ward}, ${orderData.shippingAddress.district}, ${orderData.shippingAddress.city}`,
        notes: orderData.shippingAddress.note || null,
        voucherId: selectedVoucher?.id || null,
        items: cartItems.map(item => ({
          type: item.type || 'product',
          productId: item.productId || null,
          comboId: item.comboId || null,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch('/api/orders/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (response.ok) {
        clearCart();
        toast.success(data.message || 'Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.', {
          position: "top-center",
          autoClose: 5000,
        });
        // Redirect to order confirmation page or home
        setTimeout(() => {
          window.location.href = `/?orderSuccess=${data.orderNumber}`;
        }, 1000);
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (section: keyof OrderData, field: string, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.</p>
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại trang chủ
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Thông tin đặt hàng</h1>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Thông tin khách hàng
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={orderData.customerInfo.name}
                        onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={orderData.customerInfo.email}
                        onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập email"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        value={orderData.customerInfo.phone}
                        onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Địa chỉ giao hàng
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ cụ thể *
                      </label>
                      <input
                        type="text"
                        value={orderData.shippingAddress.street}
                        onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                          errors.street ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Số nhà, tên đường"
                      />
                      {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phường/Xã *
                        </label>
                        <input
                          type="text"
                          value={orderData.shippingAddress.ward}
                          onChange={(e) => handleInputChange('shippingAddress', 'ward', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                            errors.ward ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Phường/Xã"
                        />
                        {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quận/Huyện *
                        </label>
                        <input
                          type="text"
                          value={orderData.shippingAddress.district}
                          onChange={(e) => handleInputChange('shippingAddress', 'district', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                            errors.district ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Quận/Huyện"
                        />
                        {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tỉnh/Thành phố *
                        </label>
                        <input
                          type="text"
                          value={orderData.shippingAddress.city}
                          onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Tỉnh/Thành phố"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú (không bắt buộc)
                      </label>
                      <textarea
                        value={orderData.shippingAddress.note}
                        onChange={(e) => handleInputChange('shippingAddress', 'note', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        rows={3}
                        placeholder="Ghi chú cho người giao hàng"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Phương thức thanh toán
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={orderData.paymentMethod === 'cash'}
                        onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' }))}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                        <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={orderData.paymentMethod === 'bank_transfer'}
                        onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value as 'bank_transfer' }))}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                        <div className="text-sm text-gray-600">Chuyển khoản trước khi giao hàng</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    'Đặt hàng'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng của bạn</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-food.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Section */}
              <div className="mb-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Voucher giảm giá</h3>
                  {!selectedVoucher && (
                    <button
                      onClick={() => setShowVoucherSection(!showVoucherSection)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Chọn voucher
                    </button>
                  )}
                </div>

                {/* Selected Voucher Display */}
                {selectedVoucher && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">{selectedVoucher.title}</p>
                          <p className="text-xs text-green-600">
                            -{selectedVoucher.discountType === 'percentage' 
                              ? `${selectedVoucher.discountValue}%` 
                              : formatPrice(selectedVoucher.discountValue)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeVoucher}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Voucher Input Form */}
                {showVoucherSection && !selectedVoucher && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Nhập mã voucher"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />                      <button
                        onClick={() => applyVoucherByCode()}
                        disabled={isApplyingVoucher}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                      </button>
                    </div>

                    {/* Available Vouchers List */}
                    {isLoadingVouchers ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableVouchers.length > 0 ? (
                          availableVouchers.map((voucher) => {
                            const canUse = !voucher.minOrderValue || cartTotal >= voucher.minOrderValue;
                            return (
                              <div
                                key={voucher.id}
                                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                  canUse 
                                    ? 'border-gray-200 hover:border-green-300 hover:bg-green-50' 
                                    : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                                }`}
                                onClick={() => canUse && selectVoucher(voucher)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{voucher.title}</p>
                                    <p className="text-xs text-gray-600 mb-1">{voucher.description}</p>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <span>
                                        Giảm {voucher.discountType === 'percentage' 
                                          ? `${voucher.discountValue}%` 
                                          : formatPrice(voucher.discountValue)}
                                      </span>
                                      {voucher.minOrderValue && (
                                        <span className="ml-2">
                                          • Đơn tối thiểu {formatPrice(voucher.minOrderValue)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {canUse && (
                                    <div className="text-green-600 text-xs font-medium">
                                      Chọn
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Không có voucher khả dụng
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="text-gray-900">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí giao hàng:</span>
                  <span className="text-gray-900">{formatPrice(shippingFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-green-600">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Tổng cộng:</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-800">
                  <Truck className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Giao hàng trong 30-60 phút</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
