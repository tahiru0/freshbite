import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// GET - Lấy thống kê dashboard (Admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d, 1y

    let dateFilter: Date
    const now = new Date()
    
    switch (period) {
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Thống kê tổng quan
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      ordersByStatus
    ] = await Promise.all([
      // Tổng số users
      prisma.user.count({
        where: { role: 'CUSTOMER' }
      }),
      
      // Tổng số products
      prisma.product.count({
        where: { isActive: true }
      }),
      
      // Tổng số categories
      prisma.category.count({
        where: { isActive: true }
      }),
      
      // Tổng số orders trong kỳ
      prisma.order.count({
        where: {
          createdAt: { gte: dateFilter },
          status: { not: 'CANCELLED' }
        }
      }),
      
      // Tổng doanh thu trong kỳ
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: dateFilter },
          status: { not: 'CANCELLED' }
        }
      }),
      
      // 10 orders gần nhất
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      
      // Top 5 sản phẩm bán chạy
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
        where: {
          order: {
            createdAt: { gte: dateFilter },
            status: { not: 'CANCELLED' }
          }
        }
      }),
      
      // Thống kê orders theo status
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: {
          createdAt: { gte: dateFilter }
        }
      })
    ])    // Lấy thông tin chi tiết cho top products
    const topProductIds = topProducts.map((item: any) => item.productId)
    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: { category: true }
    })

    const topProductsWithDetails = topProducts.map((item: any) => {
      const product = productDetails.find((p: any) => p.id === item.productId)
      return {
        ...item,
        product
      }
    })

    // Thống kê doanh thu theo ngày (7 ngày gần nhất)
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM orders 
      WHERE created_at >= ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)}
        AND status != 'CANCELLED'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `

    return NextResponse.json({
      summary: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        period
      },
      recentOrders,
      topProducts: topProductsWithDetails,
      ordersByStatus,
      dailyRevenue
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
