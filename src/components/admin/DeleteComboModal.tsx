'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Package } from 'lucide-react';

interface Combo {
  id: string;
  name: string;
  description: string;
  price: string;
  category: {
    id: string;
    name: string;
  };
  images: Array<{
    url: string;
    alt?: string;
  }>;
}

interface DeleteComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  combo: Combo | null;
  loading: boolean;
}

export default function DeleteComboModal({
  isOpen,
  onClose,
  onConfirm,
  combo,
  loading
}: DeleteComboModalProps) {
  if (!isOpen || !combo) return null;

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa combo</h3>
              <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              {combo.images && combo.images.length > 0 ? (
                <Image
                  src={combo.images[0].url}
                  alt={combo.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{combo.name}</p>
                <p className="text-sm text-gray-600">{combo.category.name}</p>
                <p className="text-sm font-medium text-gray-900">
                  {Number(combo.price).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs text-yellow-800 font-bold">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Lưu ý quan trọng</p>
                <p className="text-sm text-yellow-700">
                  Xóa combo sẽ chỉ xóa combo này, các sản phẩm trong combo sẽ không bị xóa.
                  Bạn có thể sử dụng lại các sản phẩm này trong combo khác.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Bạn có chắc chắn muốn xóa combo <strong>&ldquo;{combo.name}&rdquo;</strong>?
            Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Xóa combo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}