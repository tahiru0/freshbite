import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// PUT - Cập nhật review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { rating, comment } = await request.json()

    // Kiểm tra review tồn tại và thuộc về user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review không tồn tại hoặc không có quyền sửa' },
        { status: 404 }
      )
    }

    // Cập nhật review
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({
      message: 'Cập nhật đánh giá thành công',
      review
    })
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    // Kiểm tra review tồn tại và thuộc về user (hoặc admin có thể xóa)
    const existingReview = await prisma.review.findFirst({
      where: {
        id: params.id,
        ...(user.role !== 'ADMIN' && { userId: user.id })
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review không tồn tại hoặc không có quyền xóa' },
        { status: 404 }
      )
    }

    // Xóa review
    await prisma.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Xóa đánh giá thành công'
    })
  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
