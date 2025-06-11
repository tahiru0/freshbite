import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Validate voucher for both guest and authenticated users
export async function POST(request: NextRequest) {
  try {
    const { voucherCode, orderTotal, userId } = await request.json()

    if (!voucherCode || !orderTotal) {
      return NextResponse.json(
        { error: 'Thiếu thông tin voucher hoặc tổng đơn hàng' },
        { status: 400 }
      )
    }

    // For authenticated users, check if they have permission to use this voucher
    if (userId) {
      const userVoucher = await prisma.userVoucher.findFirst({
        where: {
          userId,
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
      }      // Check minimum order value
      if (voucher.minOrderAmount && orderTotal < Number(voucher.minOrderAmount)) {
        return NextResponse.json(
          { 
            error: `Đơn hàng tối thiểu ${Number(voucher.minOrderAmount).toLocaleString('vi-VN')}đ để áp dụng voucher này`,
            minOrderValue: Number(voucher.minOrderAmount)
          },
          { status: 400 }
        )
      }

      // Check usage limits
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
      }

      // Calculate discount
      let discount = 0
      if (voucher.type === 'PERCENTAGE') {
        discount = Math.min((orderTotal * Number(voucher.value)) / 100, voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : orderTotal)
      } else if (voucher.type === 'FIXED') {
        discount = Math.min(Number(voucher.value), orderTotal)
      }

      const newTotal = Math.max(0, orderTotal - discount)

      return NextResponse.json({
        success: true,        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          description: voucher.description,
          type: voucher.type,
          value: Number(voucher.value),
          minOrderValue: voucher.minOrderAmount ? Number(voucher.minOrderAmount) : 0,
          maxDiscount: voucher.maxDiscountAmount ? Number(voucher.maxDiscountAmount) : null,
          appliedDiscount: discount
        },
        discount,
        newTotal,
        message: `Áp dụng voucher thành công! Giảm ${discount.toLocaleString('vi-VN')}đ`
      })
    } else {
      // Guest users cannot use vouchers
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để sử dụng voucher' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Validate voucher error:', error)
    return NextResponse.json(
      { error: 'Lỗi server khi validate voucher' },
      { status: 500 }
    )
  }
}
