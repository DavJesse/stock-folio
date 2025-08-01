// __tests__/use-account-balance.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useAccountBalance } from '@/hooks/use-account-balance'

describe('useAccountBalance', () => {
  const mockFetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = mockFetch // Mock global fetch
  })

  it('initializes with null balance and loading true', () => {
    const { result } = renderHook(() => useAccountBalance())

    expect(result.current.balance).toBeNull() // Default balance is null
    expect(result.current.loading).toBe(true) // Default loading state is true
  })

  it('fetches balance and updates state on success', async () => {
    const mockData = { cash_balance: 5000 }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData, // Simulate successful response
    })

    const { result } = renderHook(() => useAccountBalance())

    await waitFor(() => {
      expect(result.current.loading).toBe(false) // Wait for loading to complete
    })

    expect(result.current.balance).toBe(5000) // Expect balance to be set
  })

  it('handles fetch failure and sets loading to false', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }) // Simulate failed response

    const { result } = renderHook(() => useAccountBalance())

    await waitFor(() => {
      expect(result.current.loading).toBe(false) // Loading should still end
    })

    expect(result.current.balance).toBeNull() // Balance should remain null
  })

  it('catches fetch error and sets loading to false', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error')) // Simulate network error

    const { result } = renderHook(() => useAccountBalance())

    await waitFor(() => {
      expect(result.current.loading).toBe(false) // Loading should still end
    })

    expect(result.current.balance).toBeNull() // Balance should remain null
  })
})
