import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// GET - Lấy giỏ hàng của user
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' }
            }
          }
        },
        combo: {
          include: {
            category: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' }
            },
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = cartItems.reduce((sum: number, item: any) => {
      const price = item.product ? Number(item.product.price) : Number(item.combo.price)
      return sum + (price * item.quantity)
    }, 0)

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// POST - Thêm sản phẩm/combo vào giỏ hàng
export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult
    const { productId, comboId, quantity = 1 } = await request.json()

    if (!productId && !comboId) {
      return NextResponse.json(
        { error: 'Cần cung cấp productId hoặc comboId' },
        { status: 400 }
      )
    }

    if (productId && comboId) {
      return NextResponse.json(
        { error: 'Chỉ có thể thêm product hoặc combo, không thể cả hai' },
        { status: 400 }
      )
    }

    // Xử lý thêm sản phẩm
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: 'Sản phẩm không tồn tại hoặc đã ngừng bán' },
          { status: 404 }
        )
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: user.id,
          productId: productId
        }
      })

      if (existingItem) {
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        })
        return NextResponse.json(
          { message: 'Đã cập nhật số lượng trong giỏ hàng', cartItem: updatedItem }
        )
      } else {
        const cartItem = await prisma.cartItem.create({
          data: {
            userId: user.id,
            productId: productId,
            quantity
          }
        })
        return NextResponse.json(
          { message: 'Thêm vào giỏ hàng thành công', cartItem },
          { status: 201 }
        )
      }
    }

    // Xử lý thêm combo
    if (comboId) {
      const combo = await prisma.combo.findUnique({
        where: { id: comboId }
      })

      if (!combo || !combo.isActive) {
        return NextResponse.json(
          { error: 'Combo không tồn tại hoặc đã ngừng bán' },
          { status: 404 }
        )
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: user.id,
          comboId: comboId
        }
      })

      if (existingItem) {
        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        })
        return NextResponse.json(
          { message: 'Đã cập nhật số lượng combo trong giỏ hàng', cartItem: updatedItem }
        )
      } else {
        const cartItem = await prisma.cartItem.create({
          data: {
            userId: user.id,
            comboId: comboId,
            quantity
          }
        })
        return NextResponse.json(
          { message: 'Thêm combo vào giỏ hàng thành công', cartItem },
          { status: 201 }
        )
      }
    }
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa toàn bộ giỏ hàng
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult

    await prisma.cartItem.deleteMany({
      where: { userId: user.id }
    })

    return NextResponse.json({
      message: 'Xóa giỏ hàng thành công'
    })
  } catch (error) {
    console.error('Clear cart error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
