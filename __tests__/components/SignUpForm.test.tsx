import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from '@/src/components/SignUpForm';
import '@testing-library/jest-dom';

// Mock the global fetch API to avoid making real network requests during tests
global.fetch = jest.fn();

describe('SignUpForm', () => {
  beforeEach(() => {
    // Reset mocks before each test to prevent test cross-contamination
    jest.resetAllMocks();
  });

  it('renders email and password fields', () => {
    render(<SignUpForm />);
    // Ensure the form renders all expected input elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates email format and password length before submission', async () => {
    render(<SignUpForm />);

    // Simulate user entering invalid email and too-short password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Expect validation errors to be shown to the user
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument();
  });

  it('disables submit button when inputs are invalid', () => {
    render(<SignUpForm />);

    // Simulate empty inputs
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } });

    // Button should be disabled to prevent submission
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  it('submits form with valid input and shows success message', async () => {
    // Mock fetch to simulate a successful signup response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ message: 'User created' }),
    });

    render(<SignUpForm />);

    // Fill valid email and password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securePass123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Expect success message to be shown
    expect(await screen.findByText(/user created/i)).toBeInTheDocument();
  });

  it('displays error message on 400 or 409 response', async () => {
    // Simulate user already exists error
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'User already exists' }),
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securePass123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Expect error message from API response
    expect(await screen.findByText(/user already exists/i)).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    // Create a deferred fetch promise to test loading state
    let resolveFetch: (value?: unknown) => void;
    const fetchPromise = new Promise(resolve => (resolveFetch = resolve));
    (fetch as jest.Mock).mockReturnValue(fetchPromise);

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'loading@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'loading123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // Expect loading indicator to appear and button to be disabled
    expect(screen.getByRole('button', { name: /signing up/i })).toBeDisabled();

    resolveFetch!();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });
});
