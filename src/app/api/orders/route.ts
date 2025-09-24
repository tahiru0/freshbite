import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// GET - Lấy danh sách orders
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) return authResult

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    // Nếu không phải admin, chỉ lấy orders của user đó
    if (user.role !== 'ADMIN') {
      where.userId = user.id
    }
    
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          orderItems: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}

// POST - Tạo order mới (cho phép guest checkout)
export async function POST(request: NextRequest) {
  try {
    const { 
      customerName, 
      customerPhone, 
      customerEmail,
      customerAddress, 
      notes, 
      items, // Danh sách sản phẩm/combo trong đơn hàng
      voucherCode // Optional voucher code
    } = await request.json()

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Thông tin khách hàng và sản phẩm là bắt buộc' },
        { status: 400 }
      )
    }

    // Check if user is logged in (optional)
    let user = null;
    try {
      const authResult = await authMiddleware(request);
      if (!(authResult instanceof NextResponse)) {
        user = authResult.user;
      }
    } catch {
      // User not logged in - continue as guest
    }    // Validate products and calculate total
    let total = 0;
    const validatedItems: Array<{
      productId?: string;
      comboId?: string;
      quantity: number;
      price: string;
    }> = [];

    for (const item of items) {
      if (item.type === 'product' && item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId, isActive: true }
        });
        
        if (!product) {
          return NextResponse.json(
            { error: `Sản phẩm ${item.productId} không tồn tại` },
            { status: 400 }
          );
        }
          const itemTotal = Number(product.price) * item.quantity;
        total += itemTotal;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price.toString()
        });
        
      } else if (item.type === 'combo' && item.comboId) {
        const combo = await prisma.combo.findUnique({
          where: { id: item.comboId, isActive: true }
        });
        
        if (!combo) {
          return NextResponse.json(
            { error: `Combo ${item.comboId} không tồn tại` },
            { status: 400 }
          );
        }
          const itemTotal = Number(combo.price) * item.quantity;
        total += itemTotal;
        validatedItems.push({
          comboId: item.comboId,
          quantity: item.quantity,
          price: combo.price.toString()
        });
      }
    }

    // Apply voucher if provided and user is logged in
    const discount = 0;
    if (voucherCode && user) {
      // TODO: Implement voucher validation
      // const voucher = await validateVoucher(voucherCode, user.id, total);
      // if (voucher) {
      //   discount = voucher.discount;
      //   voucherInfo = voucher;
      // }
    }

    const finalTotal = total - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null, // null for guest orders
          customerName,
          customerPhone,
          customerEmail: customerEmail || user?.email || null,
          customerAddress,
          notes,
          total: finalTotal,
          discount,
          voucherCode: voucherCode || null,
          status: 'PENDING'
        }
      });

      // Create order items
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId || null,
            comboId: item.comboId || null,
            quantity: item.quantity,
            price: item.price
          }
        });
      }

      // Clear cart if user is logged in
      if (user) {
        await tx.cartItem.deleteMany({
          where: { userId: user.id }
        });
      }

      return newOrder;
    });    // Get order with full information
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        user: user ? {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        } : undefined,
        orderItems: {
          include: {
            product: {
              include: {
                category: true,
                images: { take: 1 }
              }
            },
            combo: {
              include: {
                category: true,
                images: { take: 1 },
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
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: 'Đặt hàng thành công', 
        order: fullOrder,
        isGuest: !user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
