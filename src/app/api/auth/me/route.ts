import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (authResult instanceof NextResponse) {
      return NextResponse.json(
        { error: 'Không có phiên đăng nhập' },
        { status: 401 }
      )
    }

    const { user } = authResult
    
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Get user session error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}