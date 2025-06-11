import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, address } = await request.json()

    // Validate phone number format
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      )
    }

    // Kiểm tra phone đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Số điện thoại đã được sử dụng' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        password: hashedPassword,
        address,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        role: true
      }
    })

    return NextResponse.json(
      { message: 'Đăng ký thành công', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
