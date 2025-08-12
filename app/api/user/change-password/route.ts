import { getUserFromSessionCookie } from "@/lib/security/get-user-from-session-cookie"
import { NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/db/models/users"
import bcrypt from "bcrypt"
import db from "@/lib/db"

export async function PUT(req: NextRequest) {
  // Retrieve user session from cookies
  const session = await getUserFromSessionCookie(req)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Parse old and new passwords from request body
  const { oldPassword, newPassword } = await req.json()
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Fetch user data by ID from the session
  const user = getUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Validate old password against stored hash
  const valid = await bcrypt.compare(oldPassword, user.password_hash)
  if (!valid) {
    return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 })
  }

  // Hash the new password
  const newHash = await bcrypt.hash(newPassword, 10)

  // Update the password hash in the database
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, session.userId)

  // Update the password hash in the database
  return NextResponse.json({ message: "Password updated successfully" })
}
