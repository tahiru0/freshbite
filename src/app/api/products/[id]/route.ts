import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'
import { deleteImage } from '@/lib/cloudinary'

// GET - Lấy product theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' }
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
          select: {
            reviews: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }    // Tính average rating
    const totalRating = product.reviews.reduce((sum: number, review) => sum + review.rating, 0)
    const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0

    const productWithRating = {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: product._count.reviews
    }

    return NextResponse.json({ product: productWithRating })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params;
    const { name, description, price, categoryId, isActive, images, imagesToDelete } = await request.json()

    // Kiểm tra sản phẩm tồn tại
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    // Kiểm tra category tồn tại nếu có thay đổi
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Danh mục không tồn tại' },
          { status: 400 }
        )      }
    }

    // Xóa ảnh cũ từ Cloudinary nếu có
    if (imagesToDelete && imagesToDelete.length > 0) {
      const deletePromises = imagesToDelete.map((publicId: string) => deleteImage(publicId))
      await Promise.all(deletePromises)
    }    // Cập nhật sản phẩm
    const product = await prisma.$transaction(async (tx) => {
      // Xóa ảnh cũ từ database nếu có
      if (imagesToDelete && imagesToDelete.length > 0) {
        await tx.productImage.deleteMany({
          where: {
            productId: id,
            publicId: { in: imagesToDelete }
          }
        })
      }

      // Cập nhật thông tin sản phẩm
      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          price,
          categoryId,
          isActive
        }
      })      // Thêm ảnh mới nếu có
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: { url: string; publicId: string; alt?: string }, index: number) => ({
            productId: id,
            url: img.url,
            publicId: img.publicId,
            alt: img.alt || name,
            order: index
          }))
        })
      }

      // Lấy sản phẩm với ảnh mới
      return await tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      message: 'Cập nhật sản phẩm thành công',
      product
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    const { id } = await params;

    // Kiểm tra sản phẩm tồn tại
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    // Kiểm tra sản phẩm có trong order nào không
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa sản phẩm đã có trong đơn hàng' },
        { status: 400 }
      )
    }    // Xóa ảnh từ Cloudinary
    const deleteImagePromises = product.images.map((img) => deleteImage(img.publicId))
    await Promise.all(deleteImagePromises)

    // Xóa sản phẩm (cascade sẽ xóa images, reviews, cart items)
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Xóa sản phẩm thành công'
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
