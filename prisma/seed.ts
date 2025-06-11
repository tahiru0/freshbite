import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
    publicId: 'sample-pizza-1',
    alt: 'Pizza Margherita'
  },
  {
    url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=500',
    publicId: 'sample-burger-1', 
    alt: 'Burger'
  },
  {
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
    publicId: 'sample-salad-1',
    alt: 'Salad'
  }
]

async function main() {
  console.log('🌱 Seeding database...')  // Xóa dữ liệu cũ
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.userVoucher.deleteMany()
  await prisma.voucher.deleteMany()
  await prisma.comboItem.deleteMany()
  await prisma.comboImage.deleteMany()
  await prisma.combo.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  // Tạo admin user
  const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      phone: process.env.ADMIN_PHONE || '0901234567',
      email: process.env.ADMIN_EMAIL || 'admin@freshbite.com',
      name: 'Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
      address: 'Hà Nội, Việt Nam'
    }
  })

  // Tạo sample customer
  const hashedCustomerPassword = await bcrypt.hash('customer123', 12)
  
  const customer = await prisma.user.create({
    data: {
      phone: '0987654321',
      email: 'customer@example.com',
      name: 'Khách hàng mẫu',
      password: hashedCustomerPassword,
      role: 'CUSTOMER',
      address: 'TP.HCM, Việt Nam'
    }
  })
  // Tạo categories
  const categories = [
    {
      name: 'Cơm',
      description: 'Các món cơm đậm đà hương vị',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300'
    },
    {
      name: 'Phở',
      description: 'Phở Việt Nam truyền thống',
      image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=300'
    },
    {
      name: 'Bún',
      description: 'Các món bún đặc sản',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300'
    },
    {
      name: 'Bánh mì',
      description: 'Bánh mì Việt Nam',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=300'
    },
    {
      name: 'Đồ uống',
      description: 'Nước giải khát và đồ uống',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300'
    }
  ]

  const createdCategories = []
  for (const categoryData of categories) {
    const category = await prisma.category.create({
      data: categoryData
    })
    createdCategories.push(category)
  }
  // Tạo products với nhiều ảnh
  const products = [
    // Cơm
    {
      name: 'Cơm gà xối mỡ',
      description: 'Cơm gà thơm ngon với nước mắm đậm đà',
      price: 45000,
      categoryName: 'Cơm',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500',
          publicId: 'com-ga-xoi-mo-1',
          alt: 'Cơm gà xối mỡ',
          order: 0
        },
        {
          url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500',
          publicId: 'com-ga-xoi-mo-2',
          alt: 'Cơm gà xối mỡ góc khác',
          order: 1
        }
      ]
    },
    {
      name: 'Cơm tấm sườn nướng',
      description: 'Cơm tấm sườn nướng truyền thống',
      price: 50000,
      categoryName: 'Cơm',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500',
          publicId: 'com-tam-suon-nuong-1',
          alt: 'Cơm tấm sườn nướng',
          order: 0
        }
      ]
    },
    {
      name: 'Cơm chiên dương châu',
      description: 'Cơm chiên với tôm, xúc xích và rau củ',
      price: 55000,
      categoryName: 'Cơm',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
          publicId: 'com-chien-duong-chau-1',
          alt: 'Cơm chiên dương châu',
          order: 0
        }
      ]
    },
    
    // Phở
    {
      name: 'Phở bò tái',
      description: 'Phở bò với thịt tái tươi ngon',
      price: 60000,
      categoryName: 'Phở',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=500',
          publicId: 'pho-bo-tai-1',
          alt: 'Phở bò tái',
          order: 0
        }
      ]
    },
    {
      name: 'Phở bò chín',
      description: 'Phở bò với thịt chín mềm',
      price: 60000,
      categoryName: 'Phở',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500',
          publicId: 'pho-bo-chin-1',
          alt: 'Phở bò chín',
          order: 0
        }
      ]
    },
    {
      name: 'Phở gà',
      description: 'Phở gà thanh đạm, bổ dưỡng',
      price: 55000,
      categoryName: 'Phở',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
          publicId: 'pho-ga-1',
          alt: 'Phở gà',
          order: 0
        }
      ]
    },
    
    // Bún
    {
      name: 'Bún bò Huế',
      description: 'Bún bò Huế cay nồng đặc trưng',      price: 50000,
      categoryName: 'Bún',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500',
          publicId: 'bun-bo-hue-1',
          alt: 'Bún bò Huế',
          order: 0
        }
      ]
    },
    {
      name: 'Bún chả Hà Nội',
      description: 'Bún chả Hà Nội truyền thống',
      price: 45000,
      categoryName: 'Bún',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=500',
          publicId: 'bun-cha-ha-noi-1',
          alt: 'Bún chả Hà Nội',
          order: 0
        }
      ]
    },
    {
      name: 'Bún riêu cua',
      description: 'Bún riêu cua chua cay',
      price: 48000,
      categoryName: 'Bún',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=500',
          publicId: 'bun-rieu-cua-1',
          alt: 'Bún riêu cua',
          order: 0
        }
      ]
    },
    
    // Bánh mì
    {
      name: 'Bánh mì thịt nướng',
      description: 'Bánh mì với thịt nướng thơm lừng',
      price: 25000,
      categoryName: 'Bánh mì',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=500',
          publicId: 'banh-mi-thit-nuong-1',
          alt: 'Bánh mì thịt nướng',
          order: 0
        }
      ]
    },
    {
      name: 'Bánh mì chả cá',
      description: 'Bánh mì chả cá Hà Nội',
      price: 30000,
      categoryName: 'Bánh mì',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
          publicId: 'banh-mi-cha-ca-1',
          alt: 'Bánh mì chả cá',
          order: 0
        }
      ]
    },
    {
      name: 'Bánh mì pate',
      description: 'Bánh mì pate truyền thống',
      price: 20000,
      categoryName: 'Bánh mì',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500',
          publicId: 'banh-mi-pate-1',
          alt: 'Bánh mì pate',
          order: 0
        }
      ]
    },
    
    // Đồ uống
    {
      name: 'Trà đá',
      description: 'Trà đá mát lạnh',
      price: 10000,
      categoryName: 'Đồ uống',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
          publicId: 'tra-da-1',
          alt: 'Trà đá',
          order: 0
        }
      ]
    },
    {
      name: 'Nước cam tươi',
      description: 'Nước cam tươi nguyên chất',      price: 25000,
      categoryName: 'Đồ uống',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1582654596442-2f9e9c4beba5?w=500',
          publicId: 'nuoc-cam-tuoi-1',
          alt: 'Nước cam tươi',
          order: 0
        }
      ]
    },
    {
      name: 'Cà phê sữa đá',
      description: 'Cà phê sữa đá truyền thống',
      price: 20000,
      categoryName: 'Đồ uống',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500',
          publicId: 'ca-phe-sua-da-1',
          alt: 'Cà phê sữa đá',
          order: 0
        }
      ]
    }
  ]

  // Tạo products với images
  for (const productData of products) {
    const category = createdCategories.find(c => c.name === productData.categoryName)
    if (category) {
      const product = await prisma.product.create({        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          categoryId: category.id,
          images: {
            create: productData.images
          }
        }
      })
      console.log(`✅ Created product: ${product.name}`)
    }
  }

  // Tạo combos
  const allProducts = await prisma.product.findMany()
  const combos = [
    {
      name: 'Combo Cơm Gà Trọn Vị',
      description: 'Cơm gà xối mỡ + trà đá + bánh tráng nướng',
      price: 65000,
      originalPrice: 75000,
      categoryId: createdCategories[0].id, // Cơm category
      images: [
        {
          url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500',
          publicId: 'combo-com-ga-1',
          alt: 'Combo Cơm Gà'
        }
      ],
      items: [
        { productId: allProducts[0]?.id, quantity: 1 }, // Cơm gà
        { productId: allProducts[allProducts.length - 3]?.id, quantity: 1 } // Trà đá
      ]
    },
    {
      name: 'Combo Phở Đặc Biệt',
      description: 'Phở bò tái + bánh mì pate + cà phê sữa đá',
      price: 85000,
      originalPrice: 95000,
      categoryId: createdCategories[1].id, // Phở category
      images: [
        {
          url: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=500',
          publicId: 'combo-pho-1',
          alt: 'Combo Phở'
        }
      ],
      items: [
        { productId: allProducts[3]?.id, quantity: 1 }, // Phở bò tái
        { productId: allProducts[allProducts.length - 6]?.id, quantity: 1 }, // Bánh mì pate
        { productId: allProducts[allProducts.length - 1]?.id, quantity: 1 } // Cà phê sữa đá
      ]
    },
    {
      name: 'Combo Bún Healthy',
      description: 'Bún bò Huế + bánh mì thịt nướng + nước cam tươi',
      price: 75000,
      originalPrice: 85000,
      categoryId: createdCategories[2].id, // Bún category
      images: [
        {
          url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=500',
          publicId: 'combo-bun-1',
          alt: 'Combo Bún'
        }
      ],
      items: [
        { productId: allProducts[6]?.id, quantity: 1 }, // Bún bò Huế
        { productId: allProducts[allProducts.length - 7]?.id, quantity: 1 }, // Bánh mì thịt nướng
        { productId: allProducts[allProducts.length - 2]?.id, quantity: 1 } // Nước cam tươi
      ]
    }
  ]

  for (const comboData of combos) {
    const { items, images, ...comboInfo } = comboData
    
    const combo = await prisma.combo.create({
      data: {
        ...comboInfo,
        images: {
          create: images
        },
        items: {
          create: items.filter(item => item.productId) // Chỉ tạo items có productId hợp lệ
        }
      }
    })
    
    console.log(`✅ Created combo: ${combo.name}`)
  }  // Tạo vouchers
  const vouchers = [
    {
      code: 'WELCOME10',
      name: 'Chào mừng khách hàng mới',
      description: 'Giảm 10% cho đơn hàng đầu tiên',
      type: 'PERCENTAGE' as const,
      value: 10,
      minOrderAmount: 100000,
      maxDiscountAmount: 50000,
      usageLimit: 100,
      userLimit: 1,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'SAVE20K',
      name: 'Tiết kiệm 20K',
      description: 'Giảm 20.000đ cho đơn từ 200K',
      type: 'FIXED' as const,
      value: 20000,
      minOrderAmount: 200000,
      maxDiscountAmount: 20000,
      usageLimit: 50,
      userLimit: 2,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'HEALTHY50',
      name: 'Ăn healthy giảm 50K',
      description: 'Giảm 50.000đ cho đơn từ 300K',
      type: 'FIXED' as const,
      value: 50000,
      minOrderAmount: 300000,
      maxDiscountAmount: 50000,
      usageLimit: 30,
      userLimit: 1,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true
    },
    {
      code: 'VIP15',
      name: 'VIP 15% OFF',
      description: 'Giảm 15% cho khách hàng VIP',
      type: 'PERCENTAGE' as const,
      value: 15,
      minOrderAmount: 150000,
      maxDiscountAmount: 100000,
      usageLimit: 20,
      userLimit: 3,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true
    }
  ]

  const createdVouchers = []
  for (const voucherData of vouchers) {
    const voucher = await prisma.voucher.create({
      data: voucherData
    })
    createdVouchers.push(voucher)
    console.log(`✅ Created voucher: ${voucher.code}`)
  }

  // Tạo user vouchers - gán voucher cho customer
  const userVouchers = [
    {
      userId: customer.id,
      voucherId: createdVouchers[0].id, // WELCOME10
      usedCount: 0
    },
    {
      userId: customer.id,
      voucherId: createdVouchers[1].id, // SAVE20K
      usedCount: 0
    },
    {
      userId: customer.id,
      voucherId: createdVouchers[2].id, // HEALTHY50
      usedCount: 0
    },
    {
      userId: customer.id,
      voucherId: createdVouchers[3].id, // VIP15
      usedCount: 0
    }
  ]

  for (const userVoucherData of userVouchers) {
    await prisma.userVoucher.create({
      data: userVoucherData
    })
  }

  // Tạo sample reviews
  const sampleReviews = [
    {
      rating: 5,
      comment: 'Món ăn rất ngon, phục vụ tốt!',
      userId: customer.id,
      productId: allProducts[0]?.id
    },
    {
      rating: 4,
      comment: 'Đkho vị ổn, giá hợp lý',
      userId: customer.id,
      productId: allProducts[1]?.id
    }
  ]

  for (const reviewData of sampleReviews) {
    if (reviewData.productId) {
      await prisma.review.create({
        data: reviewData
      })
    }
  }  console.log('✅ Database seeded successfully!')
  console.log(`👤 Admin user: ${admin.phone} (${admin.email})`)
  console.log(`👤 Customer user: ${customer.phone} (${customer.email})`)
  console.log(`📂 Created ${createdCategories.length} categories`)
  console.log(`🍽️  Created ${products.length} products`)
  console.log(`🍱 Created ${combos.length} combos`)
  console.log(`🎫 Created ${createdVouchers.length} vouchers`)
  console.log(`🎟️  Assigned ${userVouchers.length} vouchers to customer`)
  console.log(`⭐ Created sample reviews`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
