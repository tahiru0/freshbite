import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Guest checkout (không cần đăng nhập)
export async function POST(request: NextRequest) {
  try {    const { 
      customerName, 
      customerPhone, 
      customerEmail,
      customerAddress, 
      notes, 
      items // Danh sách sản phẩm/combo từ client
    } = await request.json()

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin và chọn sản phẩm' },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
    if (!phoneRegex.test(customerPhone)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      )
    }

    // Validate email if provided
    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json(
          { error: 'Email không hợp lệ' },
          { status: 400 }
        )
      }
    }    // Validate products and calculate total
    let total = 0;
    const validatedItems: Array<{
      productId?: string;
      comboId?: string;
      quantity: number;
      price: string;
      name: string;
    }> = [];

    for (const item of items) {
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Số lượng sản phẩm phải lớn hơn 0' },
          { status: 400 }
        )
      }

      if (item.type === 'product' && item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId, isActive: true }
        });
        
        if (!product) {
          return NextResponse.json(
            { error: `Sản phẩm không còn khả dụng` },
            { status: 400 }
          );
        }
          const itemTotal = Number(product.price) * item.quantity;
        total += itemTotal;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price.toString(),
          name: product.name
        });
        
      } else if (item.type === 'combo' && item.comboId) {
        const combo = await prisma.combo.findUnique({
          where: { id: item.comboId, isActive: true }
        });
        
        if (!combo) {
          return NextResponse.json(
            { error: `Combo không còn khả dụng` },
            { status: 400 }
          );
        }
          const itemTotal = Number(combo.price) * item.quantity;
        total += itemTotal;
        validatedItems.push({
          comboId: item.comboId,
          quantity: item.quantity,
          price: combo.price.toString(),
          name: combo.name
        });
      } else {
        return NextResponse.json(
          { error: 'Dữ liệu sản phẩm không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Minimum order validation
    if (total < 50000) {
      return NextResponse.json(
        { error: 'Đơn hàng tối thiểu là 50.000đ' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: null, // Guest order
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          customerAddress,
          notes: notes || null,
          total,
          discount: 0,
          voucherCode: null,
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

      return newOrder;
    });

    // Get order with full information
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
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
        message: 'Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.', 
        order: fullOrder,
        orderNumber: order.orderNumber,
        isGuest: true
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Guest checkout error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
