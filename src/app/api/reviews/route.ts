import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// GET - Lấy reviews cho sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!productId) {
      return NextResponse.json(
        { error: 'ProductId là bắt buộc' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { productId } })
    ])

    // Tính average rating
    const avgResult = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    })

    return NextResponse.json({
      reviews,
      averageRating: avgResult._avg.rating || 0,
      totalReviews: avgResult._count.rating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// POST - Tạo review mới
export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { productId, rating, comment } = await request.json()

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    // Kiểm tra user đã mua sản phẩm chưa
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: 'DELIVERED'
        }
      }
    })

    if (!hasOrdered) {
      return NextResponse.json(
        { error: 'Bạn cần mua sản phẩm trước khi đánh giá' },
        { status: 403 }
      )
    }

    // Kiểm tra user đã review chưa
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Bạn đã đánh giá sản phẩm này rồi' },
        { status: 400 }
      )
    }

    // Tạo review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(
      { message: 'Đánh giá thành công', review },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
