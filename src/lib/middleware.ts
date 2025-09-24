import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function authMiddleware(request: NextRequest, requiredRole?: 'ADMIN' | 'CUSTOMER') {
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  })

  if (!user) {
    return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 401 })
  }

  if (requiredRole && user.role !== requiredRole) {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 })
  }

  return { user }
}
