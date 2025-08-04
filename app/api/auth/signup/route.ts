import { NextRequest, NextResponse } from 'next/server'
import { validateCsrf } from '@/lib/security/validate-csrf'
import { handleSignup } from '@/lib/handlers/signup'
import path from 'path'
import fs from 'fs'
import { randomUUID } from 'crypto'
import Busboy from 'busboy'

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
}

/**
 * Handles user signup requests with CSRF validation and file upload.
 */

export async function POST(req: NextRequest) {
  if (!(await validateCsrf(req))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  const contentType = req.headers.get('content-type') || ''
  const busboy = Busboy({ headers: { 'content-type': contentType } })

  const fields: Record<string, string> = {}
  let imagePath = ''

  const savePath = path.join(process.cwd(), 'public', 'profile-image-uploads')
  if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true })

  const promise = new Promise<{ fields: Record<string, string>; imagePath: string }>((resolve, reject) => {
    busboy.on('field', (name, value) => {
      fields[name] = value
    })

    busboy.on('file', (name, file, info) => {
      const { filename } = info
      const uniqueName = `${randomUUID()}-${filename}`
      const fullPath = path.join(savePath, uniqueName)
      imagePath = `/profile-image-uploads/${uniqueName}`

      const writeStream = fs.createWriteStream(fullPath)
      file.pipe(writeStream)
    })

    busboy.on('finish', () => {
      resolve({ fields, imagePath })
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

  const { fields: formFields, imagePath: uploadedImagePath } = await promise

  const signupResult = await handleSignup({
    email: formFields.email || '',
    password: formFields.password || '',
    first_name: formFields.first_name || '',
    last_name: formFields.last_name || '',
    image: uploadedImagePath,
  })

  return NextResponse.json(signupResult.body, { status: signupResult.status })
}
