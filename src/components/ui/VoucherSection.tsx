'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket, Clock, Percent, DollarSign } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { fetchUserVouchers } from '@/lib/api';

interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isValid: boolean;
  expiryDate: Date;
}

interface VoucherSectionProps {
  currentTotal: number;
  onVoucherSelect?: (voucher: Voucher) => void;
  redirectToCheckout?: boolean; // Thêm prop để redirect thay vì callback
}

export default function VoucherSection({ currentTotal, onVoucherSelect, redirectToCheckout = false }: VoucherSectionProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchVouchers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, currentTotal]);  const fetchVouchers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Use authenticated API function
      const data = await fetchUserVouchers(currentTotal);
      setVouchers(data.vouchers || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setError('Lỗi khi tải voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherClick = (voucher: Voucher) => {
    if (!voucher.isValid) return;
    
    if (redirectToCheckout) {
      // Redirect đến checkout với voucher code
      router.push(`/checkout?voucher=${voucher.code}`);
    } else if (onVoucherSelect) {
      // Callback để handle voucher selection
      onVoucherSelect(voucher);
    }
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
    }
  };

  const formatExpiryDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };
  if (authLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Ticket className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Voucher khuyến mãi</h3>
        </div>
        <p className="text-gray-600 text-sm">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center space-x-2 mb-2">
          <Ticket className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-orange-800">Voucher khuyến mãi</h3>
        </div>
        <p className="text-orange-700 text-sm">
          <span className="font-medium">Đăng nhập</span> để xem và sử dụng các voucher khuyến mãi hấp dẫn!
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Ticket className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Voucher khuyến mãi</h3>
        </div>
        <p className="text-gray-600 text-sm">Đang tải voucher...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center space-x-2 mb-2">
          <Ticket className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-800">Voucher khuyến mãi</h3>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Ticket className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Voucher khuyến mãi</h3>
        </div>
        <p className="text-gray-600 text-sm">Hiện tại bạn chưa có voucher khả dụng.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
      <div className="flex items-center space-x-2 mb-3">
        <Ticket className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-green-800">Voucher khuyến mãi</h3>
      </div>
      
      <div className="space-y-2">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              voucher.isValid 
                ? 'border-green-300 bg-white hover:border-green-400 hover:shadow-sm' 
                : 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed'
            }`}            onClick={() => handleVoucherClick(voucher)}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`p-1 rounded ${voucher.isValid ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {voucher.discountType === 'PERCENTAGE' ? (
                    <Percent className={`h-3 w-3 ${voucher.isValid ? 'text-green-600' : 'text-gray-400'}`} />
                  ) : (
                    <DollarSign className={`h-3 w-3 ${voucher.isValid ? 'text-green-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <span className={`font-semibold text-sm ${voucher.isValid ? 'text-green-800' : 'text-gray-600'}`}>
                  {voucher.code}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  voucher.isValid 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {formatDiscount(voucher)}
                </span>
              </div>
              <p className={`text-xs ${voucher.isValid ? 'text-green-700' : 'text-gray-500'}`}>
                {voucher.description}
              </p>              {!voucher.isValid && (
                <p className="text-xs text-red-600 mt-1">
                  Tối thiểu {voucher.minOrderValue?.toLocaleString('vi-VN')}đ
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Clock className={`h-3 w-3 ${voucher.isValid ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs ${voucher.isValid ? 'text-green-600' : 'text-gray-400'}`}>
                  {formatExpiryDate(voucher.expiryDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-green-700 mt-2 text-center">
        💡 Chọn voucher để áp dụng khi thanh toán
      </p>
    </div>
  );
}
