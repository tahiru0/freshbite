import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Xóa cookie
    const response = NextResponse.json({
      message: 'Đăng xuất thành công'
    })
    
    // Xóa token cookie
    response.cookies.delete('token')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
