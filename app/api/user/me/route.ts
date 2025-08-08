import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { NextRequest, NextResponse } from 'next/server'
import { getPasswordlessUserById, updateUserById } from '@/db/models/users'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import Busboy from 'busboy'

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
}

/**
 * GET /api/user/me
 * Retrieves the current authenticated user's information.
 */
export async function GET(req: NextRequest) {
  // Get the session from the request cookie
  const session = await getUserFromSessionCookie(req)

  // If session is not found, return 401 Unauthorized
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch user data from the database
  const safeUser = await getPasswordlessUserById(session.userId)

  // If user not found, return 404 Not Found
  if (!safeUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Return the user data
  return NextResponse.json(safeUser)
}

/**
 * PUT /api/user/me
 * Updates the current authenticated user's profile information.
 */
export async function PUT(req: NextRequest) {
  // Get the session from the request cookie
  const session = await getUserFromSessionCookie(req)

  // If session is not found, return 401 Unauthorized
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId
  
  // Get current user to access existing image path for cleanup
  const currentUser = await getPasswordlessUserById(userId)
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const contentType = req.headers.get('content-type') || ''
  
  // Handle both JSON and multipart form data
  if (contentType.includes('application/json')) {
    // Handle JSON request (no file upload)
    const body = await req.json()
    
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updated = await updateUserById(userId, {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      image: body.image || currentUser.image, // Keep existing image if not provided
    })

    if (!updated) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } 
  
  // Handle multipart form data (with file upload)
  if (contentType.includes('multipart/form-data')) {
    const busboy = Busboy({ headers: { 'content-type': contentType } })
    
    const fields: Record<string, string> = {}
    let newImagePath = ''
    
    const savePath = path.join(process.cwd(), 'public', 'profile-image-uploads')
    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true })

    const promise = new Promise<{ fields: Record<string, string>; imagePath: string }>((resolve, reject) => {
      busboy.on('field', (name, value) => {
        fields[name] = value
      })

      busboy.on('file', (name, file, info) => {
        const { filename, mimeType } = info
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(mimeType)) {
          reject(new Error('Only JPEG and PNG images are allowed'))
          return
        }

        const uniqueName = `${randomUUID()}-${filename}`
        const fullPath = path.join(savePath, uniqueName)
        newImagePath = `/profile-image-uploads/${uniqueName}`

        const writeStream = fs.createWriteStream(fullPath)
        let fileSize = 0
        const maxSize = 20 * 1024 * 1024 // 20MB

        // Track file size as it's being written
        file.on('data', (chunk) => {
          fileSize += chunk.length
          if (fileSize > maxSize) {
            file.destroy()
            writeStream.destroy()
            // Clean up the partial file
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath)
            }
            reject(new Error('File size must be less than 20MB'))
            return
          }
        })

        file.pipe(writeStream)
        
        // Clean up old image file if upload succeeds
        writeStream.on('finish', () => {
          if (currentUser.image && currentUser.image.startsWith('/profile-image-uploads/')) {
            const oldImagePath = path.join(process.cwd(), 'public', currentUser.image)
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath)
            }
          }
        })

        writeStream.on('error', (err) => {
          // Clean up the partial file on write error
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath)
          }
          reject(err)
        })
      })

      busboy.on('finish', () => {
        resolve({ fields, imagePath: newImagePath })
      })

      busboy.on('error', (err) => reject(err))
    })

    const reader = req.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) busboy.write(value)
    }
    busboy.end()

    try {
      const { fields: formFields, imagePath: uploadedImagePath } = await promise

      // Validate required fields
      if (!formFields.first_name || !formFields.last_name || !formFields.email) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      // Update user with new data
      const updated = await updateUserById(userId, {
        first_name: formFields.first_name,
        last_name: formFields.last_name,
        email: formFields.email,
        image: uploadedImagePath || currentUser.image, // Use new image or keep existing
      })

      if (!updated) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
      }

      return NextResponse.json({ message: 'User updated successfully' })
    } catch (error) {
      // Handle validation errors from file processing
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      return NextResponse.json({ error: 'File processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
}
