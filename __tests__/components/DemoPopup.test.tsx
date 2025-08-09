/**
 * @fileoverview
 * Unit tests for the DemoPopup component. These tests verify:
 * - Popup rendering based on localStorage content
 * - Removal of localStorage key after rendering
 * - Confetti animation trigger
 * - Proper closing behavior (clicking backdrop or close button)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DemoPopup from '@/components/DemoPopup';
import confetti from 'canvas-confetti';

// Mock canvas-confetti to prevent real animation execution during test runs
jest.mock('canvas-confetti', () => jest.fn());

describe('DemoPopup', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Mock localStorage with predefined key-value pair
    const store: Record<string, string> = {
      demoMessage: 'You have successfully signed up!',
    };

    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
    };

    // Override browser's localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  afterEach(() => {
    // Restore original localStorage and clear mocks
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
    });
    jest.clearAllMocks();
  });

  it('renders the popup if localStorage contains demoMessage', async () => {
    render(<DemoPopup />);

    // Ensure both title and message are visible
    expect(await screen.findByText(/Congratulations!/)).toBeInTheDocument();
    expect(screen.getByText('You have successfully signed up!')).toBeInTheDocument();
  });

  it('removes demoMessage from localStorage after the popup loads', async () => {
    render(<DemoPopup />);

    // Wait for localStorage cleanup
    await waitFor(() => {
      expect(window.localStorage.getItem('demoMessage')).toBe(null);
    });
  });

  it('triggers confetti animation when popup opens', async () => {
    render(<DemoPopup />);

    // Wait for popup to appear
    await screen.findByRole('dialog');

    // Check if confetti was called
    expect(confetti).toHaveBeenCalledTimes(1);
  });


  it('closes the popup when clicking outside the popup (backdrop)', async () => {
    render(<DemoPopup />);
  
    const backdrop = await screen.findByRole('dialog');
    fireEvent.click(backdrop);
  
    await waitFor(() => {
      expect(screen.queryByText(/Congratulations!/)).not.toBeInTheDocument();
    });
  });
  
  it('closes the popup when clicking the close button', async () => {
    render(<DemoPopup />);
  
    const closeBtn = await screen.findByLabelText('Close popup');
    fireEvent.click(closeBtn);
  
    await waitFor(() => {
      expect(screen.queryByText(/Congratulations!/)).not.toBeInTheDocument();
    });
  });
});
