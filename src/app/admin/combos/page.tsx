'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit, Eye, Star, Tag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import ComboModal from '@/components/admin/ComboModal';
import DeleteComboModal from '@/components/admin/DeleteComboModal';

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
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  images: Array<{
    url: string;
  }>;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<Combo | null>(null);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');

    if (!token || !user) {
      window.location.href = '/admin/login';
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'ADMIN') {
      window.location.href = '/admin/login';
      return;
    }

    fetchCategories();
    fetchProducts();
    fetchCombos();
  }, [search, categoryFilter, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        includeInactive: 'true'
      });

      if (search) params.append('search', search);
      if (categoryFilter) params.append('categoryId', categoryFilter);

      const response = await fetch(`/api/combos?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCombos(data.combos || []);
        setPagination(data.pagination || pagination);
      } else {
        console.error('Failed to fetch combos');
      }
    } catch (error) {
      console.error('Error fetching combos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComboStatus = async (comboId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/combos/${comboId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchCombos();
      } else {
        console.error('Failed to update combo status');
      }
    } catch (error) {
      console.error('Error updating combo status:', error);
    }
  };

  const deleteCombo = (combo: Combo) => {
    setComboToDelete(combo);
    setShowDeleteModal(true);
  };

  const confirmDeleteCombo = async () => {
    if (!comboToDelete) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/combos/${comboToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setComboToDelete(null);
        fetchCombos();
      } else {
        console.error('Failed to delete combo');
      }
    } catch (error) {
      console.error('Error deleting combo:', error);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openEditModal = (combo: Combo) => {
    setEditingCombo(combo);
    setShowEditModal(true);
  };

  const handleSubmit = async (submitData: FormData) => {
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');

      const url = editingCombo ? `/api/combos/${editingCombo.id}` : '/api/combos';
      const method = editingCombo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingCombo(null);
        fetchCombos();
      } else {
        console.error('Failed to save combo');
      }
    } catch (error) {
      console.error('Error saving combo:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý combo</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý tất cả combo sản phẩm</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            <span>{pagination.total} combo</span>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm combo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm combo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {combos.map((combo) => (
                <div key={combo.id} className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                  {/* Combo Image */}
                  <div className="aspect-square bg-gray-200 relative">
                    {combo.images && combo.images.length > 0 ? (
                      <Image
                        src={combo.images[0].url}
                        alt={combo.images[0].alt || combo.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      combo.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {combo.isActive ? 'Active' : 'Inactive'}
                    </div>
                    {/* Discount Badge */}
                    {combo.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        -{combo.discount}%
                      </div>
                    )}
                  </div>

                  {/* Combo Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {combo.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {combo.category.name}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {combo.averageRating.toFixed(1)} ({combo.totalReviews})
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {Number(combo.price).toLocaleString('vi-VN')}₫
                        </span>
                        {combo.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {Number(combo.originalPrice).toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {combo.items.length} món
                        </span>
                      </div>
                      {/* Product Images Preview */}
                      <div className="flex -space-x-2 overflow-hidden">
                        {combo.items.slice(0, 4).map((item) => (
                          <div key={item.product.id} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                            {item.product.images && item.product.images.length > 0 ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-600">?</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {combo.items.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{combo.items.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mb-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        Xem
                      </button>
                      <button
                        onClick={() => openEditModal(combo)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Sửa
                      </button>
                    </div>

                    {/* Toggle Status & Delete */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleComboStatus(combo.id, combo.isActive)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                          combo.isActive
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        {combo.isActive ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button
                        onClick={() => deleteCombo(combo)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                    {pagination.total} kết quả
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-gray-700">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <ComboModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingCombo(null);
        }}
        onSubmit={handleSubmit}
        editingCombo={editingCombo}
        categories={categories}
        products={products}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteComboModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setComboToDelete(null);
        }}
        onConfirm={confirmDeleteCombo}
        combo={comboToDelete}
        loading={saving}
      />
    </div>
  );
}