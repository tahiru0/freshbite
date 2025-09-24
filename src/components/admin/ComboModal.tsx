'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Upload, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  images: Array<{
    url: string;
  }>;
}

interface Combo {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  discount: number | null;
  category: {
    id: string;
    name: string;
  };
  images: Array<{
    url: string;
    alt?: string;
  }>;
  items: Array<{
    quantity: number;
    product: {
      id: string;
      name: string;
      images: Array<{
        url: string;
      }>;
    };
  }>;
}

interface ComboFormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  categoryId: string;
  isActive: boolean;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  images: File[];
  existingImages: Array<{
    id: string;
    url: string;
  }>;
}

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingCombo?: Combo | null;
  categories: Category[];
  products: Product[];
  loading: boolean;
}

export default function ComboModal({
  isOpen,
  onClose,
  onSubmit,
  editingCombo,
  categories,
  products,
  loading
}: ComboModalProps) {
  const [formData, setFormData] = useState<ComboFormData>({
    name: '',
    description: '',
    price: '',
    discount: '',
    categoryId: '',
    isActive: true,
    items: [],
    images: [],
    existingImages: []
  });

  useEffect(() => {
    if (editingCombo) {
      setFormData({
        name: editingCombo.name,
        description: editingCombo.description,
        price: editingCombo.price,
        discount: editingCombo.discount?.toString() || '',
        categoryId: editingCombo.category.id,
        isActive: editingCombo.isActive,
        items: editingCombo.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        images: [],
        existingImages: editingCombo.images.map(img => ({
          id: img.url, // Use URL as ID since we don't have actual ID
          url: img.url
        }))
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        discount: '',
        categoryId: '',
        isActive: true,
        items: [],
        images: [],
        existingImages: []
      });
    }
  }, [editingCombo, isOpen]);

  // Recalculate price when items change
  useEffect(() => {
    if (formData.items.length > 0) {
      const originalPrice = calculateOriginalPrice();
      const calculatedPrice = calculatePrice(originalPrice, formData.discount);
      setFormData(prev => ({
        ...prev,
        price: calculatedPrice.toString()
      }));
    }
  }, [formData.items, formData.discount]);

  const handleImageUpload = (files: FileList) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...fileArray]
    }));
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const addProductToCombo = (productId: string) => {
    const existingItem = formData.items.find(item => item.productId === productId);
    if (existingItem) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { productId, quantity: 1 }]
      }));
    }
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId !== productId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        )
      }));
    }
  };

  const calculateOriginalPrice = useCallback(() => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        return total + (parseFloat(product.price) * item.quantity);
      }
      return total;
    }, 0);
  }, [formData.items, products]);

  const calculatePrice = (originalPrice: number, discount: string) => {
    const discountPercent = parseFloat(discount) || 0;
    if (originalPrice > 0 && discountPercent > 0) {
      return Math.round(originalPrice * (1 - discountPercent / 100));
    }
    return originalPrice;
  };

  const calculateDiscountFromPrices = (originalPrice: number, salePrice: number) => {
    if (originalPrice > 0 && salePrice > 0 && salePrice < originalPrice) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
  };

  const handlePriceChange = (field: 'price' | 'discount', value: string) => {
    const originalPrice = calculateOriginalPrice();
    const newFormData = { ...formData, [field]: value };

    if (field === 'discount') {
      // Tính giá bán từ giá gốc và giảm giá
      const calculatedPrice = calculatePrice(originalPrice, newFormData.discount);
      newFormData.price = calculatedPrice.toString();
    } else if (field === 'price') {
      // Tính giảm giá từ giá gốc và giá bán
      const salePrice = parseFloat(newFormData.price) || 0;
      const calculatedDiscount = calculateDiscountFromPrices(originalPrice, salePrice);
      newFormData.discount = calculatedDiscount.toString();
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const originalPrice = calculateOriginalPrice();
    const submitData = new FormData();

    // Basic fields
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    submitData.append('originalPrice', originalPrice.toString());
    if (formData.discount) submitData.append('discount', formData.discount);
    submitData.append('categoryId', formData.categoryId);
    submitData.append('isActive', formData.isActive.toString());

    // Items
    submitData.append('items', JSON.stringify(formData.items));

    // Images
    formData.images.forEach((image) => {
      submitData.append(`images`, image);
    });

    await onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingCombo ? 'Sửa combo' : 'Thêm combo mới'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên combo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá gốc (tự động)
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {calculateOriginalPrice().toLocaleString('vi-VN')}₫
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giảm giá (%)
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handlePriceChange('discount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handlePriceChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh combo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-blue-400">
                <div className="flex items-center justify-center mb-4">
                  <label className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 font-medium">Click để tải ảnh lên</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Tối đa 5MB)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.existingImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={image.url}
                              alt={`Combo image ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {formData.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ảnh mới:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-200">
                            <Image
                              src={URL.createObjectURL(image)}
                              alt={`New image ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index, false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sản phẩm trong combo
              </label>

              {/* Add Products */}
              <div className="mb-4">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addProductToCombo(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Chọn sản phẩm để thêm</option>
                  {products
                    .filter(product => !formData.items.some(item => item.productId === product.id))
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {Number(product.price).toLocaleString('vi-VN')}₫
                      </option>
                    ))}
                </select>
              </div>

              {/* Selected Products */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.items.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        {product?.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-600">?</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product?.name}</p>
                          <p className="text-sm text-gray-600">{Number(product?.price).toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProductQuantity(item.productId, 0)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center justify-center ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có sản phẩm nào trong combo
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Hiển thị combo
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingCombo ? 'Lưu thay đổi' : 'Tạo combo'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}