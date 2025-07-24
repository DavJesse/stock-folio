'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

/**
 * DemoPopup displays a congratulatory message retrieved from localStorage.
 * If a message exists under 'demoMessage', it triggers a confetti animation
 * and displays the message in a modal-like popup.
 */
export default function DemoPopup() {
  // Holds the demo message if present in localStorage
  const [demoPopup, setDemoPopup] = useState<string | null>(null)

  useEffect(() => {
    // Attempt to retrieve a message saved in localStorage
    const saved = localStorage.getItem('demoMessage')

    if (saved) {
      setDemoPopup(saved)            // Show the popup with the saved message
      localStorage.removeItem('demoMessage') // Remove the message after retrieval

      // Trigger a confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [])

  // If no message is found, render nothing
  if (!demoPopup) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--primary-background)]/5 backdrop-blur-sm"
      onClick={() => setDemoPopup(null)} // Clicking outside the box closes it
    >
      <div
        className="relative w-full max-w-sm rounded bg-[var(--button-primary)] px-6 py-4 text-white shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent inner clicks from closing the popup
      >
        {/* Close button */}
        <button
          aria-label="Close popup"
          onClick={() => setDemoPopup(null)}
          className="absolute right-2 top-2 text-white hover:text-gray-200"
        >
          &times;
        </button>

        {/* Celebration content */}
        <h1 className="text-center text-2xl">🎉</h1>
        <h2 className="mb-2 text-center text-xl font-semibold text-[var(--success-color)]">
          Congratulations!
        </h2>
        <p className="text-center text-lg">{demoPopup}</p>
      </div>
    </div>
  )
}
