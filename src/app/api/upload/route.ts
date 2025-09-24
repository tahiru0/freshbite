import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra authentication (chỉ admin mới được upload)
    const authResult = await authMiddleware(request, 'ADMIN')
    if (authResult instanceof NextResponse) return authResult

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || 'food-delivery'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Không có file nào được chọn' },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(file => uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadedImages = results.map((result: any) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }))

    return NextResponse.json({
      message: 'Upload ảnh thành công',
      images: uploadedImages
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi upload ảnh' },
      { status: 500 }
    )
  }
}
