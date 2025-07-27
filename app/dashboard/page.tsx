import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getUserIdFromSession } from '@/db/models/sessions'

export default async function DashboardPage() {
  // Read token from cookie store
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('token')?.value

  // Extract userId from session if available
  const userId = sessionId ? getUserIdFromSession(sessionId) : undefined

  // Redirect to homepage if user is not authenticated
  if (!userId) {
    redirect('/')
  }

  return (
    <div>
      <h1 className="text-2xl text-white font-bold mt-10 lg:mt-0">
        Welcome to your Dashboard
      </h1>
      {/* TODO: Render portfolio cards, charts, etc. */}
    </div>
  )
}
