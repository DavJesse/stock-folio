import { act, render, screen, fireEvent, waitFor } from '@testing-library/react'
import DashboardLayout from '@/components/DashboardLayout'
import '@testing-library/jest-dom'
import React from 'react'

/**
 * Mocks the Next.js useRouter hook to intercept navigation calls.
 */
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

/**
 * Globally mocks the fetch API to simulate a successful logout response.
 */
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Logged out successfully.' }),
  })
) as jest.Mock

describe('DashboardLayout', () => {
  /**
   * Clears mock state before each test to avoid test bleed.
   */
  beforeEach(() => {
    jest.clearAllMocks()
  })

  /**
   * UI Test: Verifies that the logout button is rendered.
   */
  it('renders logout button', async () => {
  await act(async () => {
    render(
      <DashboardLayout>
        <div>Mock Content</div>
      </DashboardLayout>
    )
  })

    const logoutButton = screen.getByRole('button', { name: /log out/i })
    expect(logoutButton).toBeInTheDocument()
  })

  /**
   * Behavior Test: Verifies logout behavior—API call and redirection.
   */
  it('calls logout API and redirects to home on logout', async () => {
    await act(async () => {
      render(
        <DashboardLayout>
          <div>Mock Content</div>
        </DashboardLayout>
      )
    })

    const logoutButton = screen.getByRole('button', { name: /log out/i })
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
      expect(pushMock).toHaveBeenCalledWith('/')
    })
  })
})
