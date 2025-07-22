import { render, screen, fireEvent } from '@testing-library/react'
import StockSearchBar from '@/components/SearchBar'
import { useSearchStocks } from '@/hooks/use-search-stocks'

jest.mock('@/hooks/use-search-stocks')

const mockedUseSearchStocks = useSearchStocks as jest.MockedFunction<typeof useSearchStocks>

describe('StockSearchBar', () => {
  const mockSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls search on input change', () => {
    // Arrange: mock hook return values
    mockedUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: null,
      search: mockSearch,
    })

    render(<StockSearchBar />)

    // Act: simulate user typing into search input
    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.change(input, { target: { value: 'AAPL' } })

    // Assert: search function is called with input value
    expect(mockSearch).toHaveBeenCalledWith('AAPL')
  })

  it('shows clear button when there is a query', () => {
    // Arrange
    mockedUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: null,
      search: mockSearch,
    })

    render(<StockSearchBar />)

    // Act
    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.change(input, { target: { value: 'TSLA' } })

    // Assert
    expect(
      screen.getByRole('button', { name: /clear search/i })
    ).toBeInTheDocument()
  })

  it('clears input and search on clear button click', () => {
    // Arrange
    mockedUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: null,
      search: mockSearch,
    })

    render(<StockSearchBar />)

    const input = screen.getByPlaceholderText('Search stocks...')
    fireEvent.change(input, { target: { value: 'MSFT' } })

    const clearBtn = screen.getByRole('button', { name: /clear search/i })

    // Act
    fireEvent.click(clearBtn)

    // Assert
    expect(mockSearch).toHaveBeenCalledWith('')
    expect(input).toHaveValue('')
  })

  it('displays loading message when loading is true', () => {
    // Arrange
    mockedUseSearchStocks.mockReturnValue({
      results: [],
      loading: true,
      error: null,
      search: mockSearch,
    })

    render(<StockSearchBar />)

    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays error message when error exists', () => {
    // Arrange
    mockedUseSearchStocks.mockReturnValue({
      results: [],
      loading: false,
      error: 'Something went wrong',
      search: mockSearch,
    })

    render(<StockSearchBar />)

    // Assert
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders list of results when available', () => {
    // Arrange
    mockedUseSearchStocks.mockReturnValue({
      loading: false,
      error: null,
      search: mockSearch,
      results: [
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          type: 'Equity',
          region: 'US',
          description: 'Google parent company',
        },
      ],
    })

    render(<StockSearchBar />)

    // Assert
    expect(screen.getAllByText(/GOOGL/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Google parent company/i)).toBeInTheDocument()
  })
})
