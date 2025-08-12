'use client'

import { useState } from "react"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"

interface EditableFieldProps {
  readonly label: string
  readonly value: string
  readonly editable: boolean
  readonly onChange?: (val: string) => void
}

export default function EditablePasswordField({ label, value, editable, onChange }: EditableFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      {/* Label for the field */}
      <label className="block text-sm text-white/60 mb-1">{label}</label>

      {editable ? (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={e => onChange?.(e.target.value)}
            className="bg-[var(--primary-background)] text-white py-1 px-2 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-white"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      ) : (
        <p className="text-white">{value || '—'}</p>
      )}
    </div>
  )
}
