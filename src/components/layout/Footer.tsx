import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🥗</span>
              </div>
              <span className="text-xl font-bold">
                Fresh
                <span className="text-green-400">Bite</span>
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Chúng tôi cam kết mang đến những bữa ăn tươi ngon, dinh dưỡng
              và dịch vụ giao hàng nhanh chóng để bạn và gia đình luôn khỏe mạnh.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Danh mục sản phẩm</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/salad" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Salad tươi
                </Link>
              </li>
              <li>
                <Link href="/categories/smoothie" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Sinh tố
                </Link>
              </li>
              <li>
                <Link href="/categories/soup" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Súp dinh dưỡng
                </Link>
              </li>
              <li>
                <Link href="/categories/snack" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Snack healthy
                </Link>
              </li>
              <li>
                <Link href="/categories/juice" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Nước ép tự nhiên
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">0901 234 567</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">info@freshbite.com</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Giờ hoạt động</h4>
              <p className="text-gray-300 text-xs">
                Thứ 2 - Chủ nhật: 7:00 - 22:00
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Fresh Bite. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/return-policy" className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                Chính sách đổi trả
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
