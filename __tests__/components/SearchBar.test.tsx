import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import StockSearchBar from '@/components/SearchBar'

// Mock the hook
const mockSearch = jest.fn()
const mockUseSearchStocks = jest.fn()

jest.mock('@/hooks/use-search-stocks', () => ({
  useSearchStocks: () => mockUseSearchStocks()
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

describe('StockSearchBar', () => {
  beforeEach(() => {
    // Use fake timers for debounce testing
    jest.useFakeTimers()
    
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Default mock return values
    mockUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: null,
      search: mockSearch
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should show loading state when searching', async () => {
    // Mock the hook to return loading state
    mockUseSearchStocks.mockReturnValue({
      results: [],
      loading: true,
      error: null,
      search: mockSearch
    })

    render(<StockSearchBar />)
    
    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Type in the input to trigger search
    await act(async () => {
      fireEvent.change(input, { target: { value: 'AAPL' } })
    })

    // Wait for debounce delay
    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    // Now the loading message should be visible
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })
  })

  it('should show loading state with proper sequence', async () => {
    // Start with initial state
    const mockSearchFn = jest.fn()
    let currentState = {
      results: [],
      loading: false,
      error: null,
      search: mockSearchFn
    }

    // Update mock to simulate state changes
    mockUseSearchStocks.mockImplementation(() => currentState)

    const { rerender } = render(<StockSearchBar />)
    
    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Type in the input
    fireEvent.change(input, { target: { value: 'AAPL' } })

    // Advance past debounce delay
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Update state to loading and rerender
    currentState = {
      ...currentState,
      loading: true
    }
    rerender(<StockSearchBar />)

    // Now check for loading message
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })
  })

  it('should display search results after loading', async () => {
    const mockResults = [
      {
        symbol: 'AAPL',
        description: 'Apple Inc.',
        type: 'Common Stock'
      }
    ]

    // Start with loading state
    mockUseSearchStocks.mockReturnValue({
      results: [],
      loading: true,
      error: null,
      search: mockSearch
    })

    const { rerender } = render(<StockSearchBar />)
    
    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Type and wait for debounce
    fireEvent.change(input, { target: { value: 'AAPL' } })
    
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Should show loading
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    })

    // Update to show results
    mockUseSearchStocks.mockReturnValue({
      results: mockResults,
      loading: false,
      error: null,
      search: mockSearch
    })

    rerender(<StockSearchBar />)

    // Should show results and hide loading
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    })
  })

  it('should handle error state', async () => {
    mockUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: 'Failed to fetch stocks',
      search: mockSearch
    })

    render(<StockSearchBar />)
    
    const input = screen.getByPlaceholderText('Search stocks...')
    
    fireEvent.change(input, { target: { value: 'INVALID' } })
    
    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch stocks')).toBeInTheDocument()
    })
  })

  it('should clear search when clear button is clicked', async () => {
    render(<StockSearchBar />)
    
    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Type something
    fireEvent.change(input, { target: { value: 'AAPL' } })
    
    // Clear button should appear
    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
    
    // Click clear button
    fireEvent.click(clearButton)
    
    // Input should be cleared
    expect(input).toHaveValue('')
    expect(mockSearch).toHaveBeenCalledWith('')
  })

  // Additional test specifically for the loading state issue
  it('should show loading immediately after typing and debounce delay', async () => {
    // Create a more realistic mock that simulates the actual hook behavior
    const mockSearchFunction = jest.fn()
    
    mockUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: null,
      search: mockSearchFunction
    })

    const { rerender } = render(<StockSearchBar />)
    
    const input = screen.getByPlaceholderText('Search stocks...')
    
    // Type something
    fireEvent.change(input, { target: { value: 'AAPL' } })
    
    // At this point, loading should still be false
    expect(screen.queryByText('Searching...')).not.toBeInTheDocument()
    
    // Fast-forward past debounce delay
    act(() => {
      jest.advanceTimersByTime(300)
    })
    
    // Now mock the hook to return loading state (simulating what happens when search is called)
    mockUseSearchStocks.mockReturnValue({
      results: [],
      loading: true,
      error: null,
      search: mockSearchFunction
    })
    
    // Re-render with new state
    rerender(<StockSearchBar />)
    
    // Now loading should be visible
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })
})