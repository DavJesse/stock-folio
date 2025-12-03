import { getUserFromSessionCookie } from "@/lib/security/get-user-from-session-cookie"
import { NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/db/models/users"
import bcrypt from "bcrypt"
import db from "@/lib/db"

export async function PUT(req: NextRequest) {
  // Validate session
  const session = await getUserFromSessionCookie(req)
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Parse body
  const { oldPassword, newPassword } = await req.json()
  if (!oldPassword || !newPassword) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  // Fetch the user from DB
  const user = await getUserById(session.userId)
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Validate old password
  const valid = await bcrypt.compare(oldPassword, user.password_hash)
  if (!valid) {
    return NextResponse.json(
      { error: "Old password is incorrect" },
      { status: 400 }
    )
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10)

  // Update using Turso client
  await db.execute({
    sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
    args: [newHash, session.userId]
  })

  return NextResponse.json({
    message: "Password updated successfully"
  })
}
