import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware'

// GET - Lấy danh sách voucher khả dụng
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userVouchers = searchParams.get('userVouchers') === 'true'
    const orderTotal = parseFloat(searchParams.get('total') || '0')

    if (userVouchers) {
      // Yêu cầu voucher của user - cần đăng nhập
      const authResult = await authMiddleware(request)
      if (authResult instanceof NextResponse) {
        return NextResponse.json(
          { error: 'Vui lòng đăng nhập để xem voucher của bạn' },
          { status: 401 }
        )
      }

      const { user } = authResult

      // Lấy vouchers mà user có thể sử dụng
      const userVoucherList = await prisma.userVoucher.findMany({
        where: {
          userId: user.id
        },
        include: {
          voucher: true
        }
      })      // Filter vouchers based on conditions
      const availableVouchers = userVoucherList
        .map((uv) => uv.voucher)
        .filter((voucher) => {
          const now = new Date()
          const validFrom = new Date(voucher.startDate)
          const validTo = voucher.endDate ? new Date(voucher.endDate) : new Date('2099-12-31')
          
          return (
            voucher.isActive &&
            now >= validFrom &&
            now <= validTo &&
            (!voucher.minOrderAmount || orderTotal >= Number(voucher.minOrderAmount))
          )
        })

      return NextResponse.json({
        vouchers: availableVouchers,
        count: availableVouchers.length
      })
    } else {
      // Lấy tất cả voucher public (không cần đăng nhập)
      const vouchers = await prisma.voucher.findMany({
        where: {
          isActive: true,
          startDate: {
            lte: new Date()
          },
          endDate: {
            gte: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })      // Filter by order total if provided
      const availableVouchers = orderTotal > 0 
        ? vouchers.filter(voucher => 
            !voucher.minOrderAmount || orderTotal >= Number(voucher.minOrderAmount)
          )
        : vouchers

      return NextResponse.json({
        vouchers: availableVouchers,
        count: availableVouchers.length
      })
    }
  } catch (error) {
    console.error('Error fetching vouchers:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy voucher' },
      { status: 500 }
    )
  }
}

// POST - Áp dụng voucher
export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để sử dụng voucher' },
        { status: 401 }
      )
    }

    const { user } = authResult
    const { voucherCode, orderTotal } = await request.json()

    if (!voucherCode || !orderTotal) {
      return NextResponse.json(
        { error: 'Thiếu thông tin voucher hoặc tổng đơn hàng' },
        { status: 400 }
      )
    }

    // Find voucher and check if user has access to it
    const userVoucher = await prisma.userVoucher.findFirst({
      where: {
        userId: user.id,
        voucher: {
          code: voucherCode.toUpperCase()
        }
      },
      include: {
        voucher: true
      }
    })

    if (!userVoucher) {
      return NextResponse.json(
        { error: 'Bạn không có quyền sử dụng mã voucher này' },
        { status: 400 }
      )
    }

    const voucher = userVoucher.voucher

    // Check if voucher is active
    if (!voucher.isActive) {
      return NextResponse.json(
        { error: 'Mã voucher đã bị vô hiệu hóa' },
        { status: 400 }
      )
    }

    // Check if voucher is within valid date range
    const now = new Date()
    if (voucher.startDate && now < voucher.startDate) {
      return NextResponse.json(
        { error: 'Mã voucher chưa có hiệu lực' },
        { status: 400 }
      )
    }

    if (voucher.endDate && now > voucher.endDate) {
      return NextResponse.json(
        { error: 'Mã voucher đã hết hạn' },
        { status: 400 }
      )
    }    // Check minimum order value
    if (voucher.minOrderAmount && orderTotal < Number(voucher.minOrderAmount)) {
      return NextResponse.json(
        { 
          error: `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString('vi-VN')}đ để áp dụng voucher này`,
          minOrderValue: Number(voucher.minOrderAmount)
        },
        { status: 400 }
      )
    }    // Check usage limits
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json(
        { error: 'Mã voucher đã hết lượt sử dụng' },
        { status: 400 }
      )
    }

    // Check user-specific limits
    if (voucher.userLimit && userVoucher.usedCount >= voucher.userLimit) {
      return NextResponse.json(
        { error: 'Bạn đã sử dụng hết lượt cho voucher này' },
        { status: 400 }
      )
    }    // Calculate discount
    let discount = 0
    if (voucher.type === 'PERCENTAGE') {
      discount = Math.min((orderTotal * Number(voucher.value)) / 100, voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : orderTotal)
    } else if (voucher.type === 'FIXED') {
      discount = Math.min(Number(voucher.value), orderTotal)
    }

    return NextResponse.json({
      success: true,      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountType: voucher.type,
        discountValue: Number(voucher.value),
        minOrderValue: voucher.minOrderAmount ? Number(voucher.minOrderAmount) : 0,
        maxDiscount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : null,
        appliedDiscount: discount
      },
      discount,
      newTotal: Math.max(0, orderTotal - discount),
      message: `Áp dụng voucher thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`
    })
  } catch (error) {
    console.error('Apply voucher error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
