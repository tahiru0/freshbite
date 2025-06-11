import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// GET - Lấy danh sách combos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (!includeInactive) {
      where.isActive = true
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [combos, total] = await Promise.all([
      prisma.combo.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' }
          },
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { order: 'asc' }
                  }
                }
              }
            }
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { reviews: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.combo.count({ where })
    ])    // Tính average rating cho mỗi combo
    const combosWithRating = combos.map((combo: any) => {
      const averageRating = combo.reviews.length > 0
        ? combo.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / combo.reviews.length
        : 0

      return {
        ...combo,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: combo._count.reviews,
        discount: combo.originalPrice 
          ? Math.round(((combo.originalPrice - combo.price) / combo.originalPrice) * 100)
          : null
      }
    })

    return NextResponse.json({
      combos: combosWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get combos error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// POST - Tạo combo mới (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    const { 
      name, 
      description, 
      price, 
      originalPrice,
      categoryId, 
      images,
      items 
    } = await request.json()

    const combo = await prisma.combo.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        categoryId,        images: {
          create: images?.map((img: { url: string; publicId: string; alt?: string }, index: number) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt || name,
            order: index
          })) || []
        },
        items: {
          create: items?.map((item: { productId: string; quantity?: number }) => ({
            productId: item.productId,
            quantity: item.quantity || 1
          })) || []
        }
      },
      include: {
        category: true,
        images: true,
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      { message: 'Tạo combo thành công', combo },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create combo error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
