import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

interface Params {
  id: string
}

// GET - Lấy chi tiết combo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const combo = await prisma.combo.findUnique({
      where: { id },
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
      }
    })

    if (!combo) {
      return NextResponse.json(
        { error: 'Combo không tồn tại' },
        { status: 404 }
      )
    }    // Tính average rating
    const averageRating = combo.reviews.length > 0
      ? combo.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / combo.reviews.length
      : 0;

    const comboWithRating = {
      ...combo,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: combo._count.reviews,
      discount: combo.originalPrice 
        ? Math.round(((Number(combo.originalPrice) - Number(combo.price)) / Number(combo.originalPrice)) * 100)
        : null
    }

    return NextResponse.json({ combo: comboWithRating })
  } catch (error) {
    console.error('Get combo detail error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật combo (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    const { 
      name, 
      description, 
      price, 
      originalPrice,
      categoryId, 
      isActive,
      images,
      items,
      imagesToDelete 
    } = await request.json()

    // Xóa ảnh cũ nếu có
    if (imagesToDelete && imagesToDelete.length > 0) {
      await prisma.comboImage.deleteMany({
        where: {
          comboId: params.id,
          publicId: { in: imagesToDelete }
        }
      })
    }

    // Xóa items cũ
    await prisma.comboItem.deleteMany({
      where: { comboId: params.id }
    })

    const combo = await prisma.combo.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        originalPrice,
        categoryId,
        isActive,        images: images ? {
          deleteMany: {},
          create: images.map((img: { url: string; publicId: string; alt?: string }, index: number) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt || name,
            order: index
          }))
        } : undefined,
        items: items ? {
          create: items.map((item: { productId: string; quantity?: number }) => ({
            productId: item.productId,
            quantity: item.quantity || 1
          }))
        } : undefined
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
      { message: 'Cập nhật combo thành công', combo }
    )
  } catch (error) {
    console.error('Update combo error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa combo (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    // Kiểm tra combo có trong đơn hàng không
    const orderItemsCount = await prisma.orderItem.count({
      where: { comboId: params.id }
    })

    if (orderItemsCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa combo đã có trong đơn hàng' },
        { status: 400 }
      )
    }

    await prisma.combo.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Xóa combo thành công' })
  } catch (error) {
    console.error('Delete combo error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
