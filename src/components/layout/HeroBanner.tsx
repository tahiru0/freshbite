'use client';

import { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaLink: string;
  gradient: string;
  stats?: { label: string; value: string }[];
}

export function HeroBanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions] = useState(['Salad tươi', 'Sinh tố detox', 'Combo tiết kiệm', 'Rau củ organic']);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);  const slides: BannerSlide[] = [
    {
      id: 1,
      title: "Thực phẩm tươi ngon",
      subtitle: "Khám phá hương vị trong từng món ăn",
      description: "",
      image: "/images/banners/hero-banner-1.jpg",
      cta: "Khám phá ngay",
      ctaLink: "/products",
      gradient: "from-green-600/80 to-emerald-800/80"
    },
    {
      id: 2,
      title: "Rau củ tươi ngon",
      subtitle: "Dinh dưỡng hoàn hảo mỗi ngày",
      description: "",
      image: "/images/banners/healthy-food-banner.jpg",
      cta: "Đặt hàng ngay",
      ctaLink: "/categories",
      gradient: "from-emerald-600/80 to-teal-700/80"
    },
    {
      id: 3,
      title: "Combo tiết kiệm",
      subtitle: "Ưu đãi đặc biệt",
      description: "",
      image: "/images/banners/combo-banner.jpg",
      cta: "Xem combo",
      ctaLink: "/combos",
      gradient: "from-orange-600/80 to-red-700/80"
    },
    {
      id: 4,
      title: "Giao hàng tận nơi",
      subtitle: "Nhanh chóng - An toàn",
      description: "",
      image: "/images/banners/delivery-banner.jpg",
      cta: "Đặt ngay",
      ctaLink: "/products",
      gradient: "from-blue-600/80 to-indigo-700/80"
    },
    {
      id: 5,
      title: "Nhà hàng cao cấp",
      subtitle: "Trải nghiệm đẳng cấp",
      description: "",
      image: "/images/banners/restaurant-banner.jpg",
      cta: "Đặt bàn",
      ctaLink: "/contact",
      gradient: "from-purple-600/80 to-pink-700/80"
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    window.location.href = `/search?q=${encodeURIComponent(suggestion)}`;
  };  return (
    <div className="relative h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          el: '.swiper-pagination-custom',
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        loop={true}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  filter: 'brightness(0.7)'
                }}
              />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">                    {/* Left Content */}
                    <div className="text-white text-center lg:text-left">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      
                      <p className="text-base sm:text-lg md:text-xl mb-6 text-white/90 max-w-lg mx-auto lg:mx-0">
                        {slide.subtitle}
                      </p>
                    </div>                    {/* Right Content - Glass Search Box */}
                    <div className="flex justify-center lg:justify-end">
                      <div className="w-full max-w-md">
                        <form onSubmit={handleSearch} className="relative">
                          <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-1 shadow-2xl">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(e.target.value.length > 0);
                              }}
                              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                              placeholder="Nhập tên món ăn, thực phẩm, sào..."
                              className="w-full px-6 py-4 pr-32 rounded-xl bg-white/90 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white/50 focus:bg-white outline-none text-gray-900 placeholder-gray-600 text-sm sm:text-base"
                            />
                            <button
                              type="submit"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                              Tìm Kiếm
                            </button>
                          </div>
                          
                          {/* Search Suggestions */}
                          {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 z-50 overflow-hidden">
                              {searchSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="w-full px-6 py-3 text-left hover:bg-green-50 transition-colors text-gray-900 text-sm sm:text-base first:hover:rounded-t-xl last:hover:rounded-b-xl"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>      {/* Custom Navigation */}
      <button className="swiper-button-prev-custom absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hidden sm:block">
        <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 transform rotate-180" />
      </button>
      <button className="swiper-button-next-custom absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hidden sm:block">
        <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3"></div>

      <style jsx>{`
        .swiper-pagination-bullet-custom {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active-custom {
          background: white;
          width: 24px;
          border-radius: 4px;
        }
        
        @media (min-width: 640px) {
          .swiper-pagination-bullet-custom {
            width: 10px;
            height: 10px;
          }
          
          .swiper-pagination-bullet-active-custom {
            width: 30px;
          }
        }
      `}</style>
    </div>
  );
}
