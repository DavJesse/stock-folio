import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie'
import { NextRequest, NextResponse } from 'next/server'
import { getPasswordlessUserById, updateUserById } from '@/db/models/users'

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
  const body = await req.json()

  // Validate required fields in the request body
  if (!body.first_name || !body.last_name || !body.email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Attempt to update the user in the database
  const updated = await updateUserById(userId, {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    image: body.image,
  })

  // If update fails, return 500 Internal Server Error
  if (!updated) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Return success response
  return NextResponse.json({ message: 'User updated successfully' })
}
