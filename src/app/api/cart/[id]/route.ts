import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// PUT - Cập nhật số lượng sản phẩm trong giỏ hàng
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult
    const { quantity } = await request.json()

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Số lượng phải lớn hơn 0' },
        { status: 400 }
      )
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        id: params.id,
        userId: user.id
      },
      data: { quantity },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Cập nhật giỏ hàng thành công',
      cartItem
    })
  } catch (error) {
    console.error('Update cart item error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa sản phẩm khỏi giỏ hàng
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    await prisma.cartItem.delete({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    return NextResponse.json({
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
    })
  } catch (error) {
    console.error('Remove cart item error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
