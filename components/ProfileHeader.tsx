'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { User } from '@/types/user'
import { useAccountBalance } from '@/hooks/use-account-balance'
import formatCurrency from '@/lib/format/format-currency'
import SaveCancelButtons from '@/components/SaveCancelButtons'
import { Camera } from 'lucide-react'

interface ProfileHeaderProps {
  readonly user: User
}

/**
 * ProfileHeader component
 * -----------------------
 * Displays a user's profile picture, name, and account balance.
 * Allows uploading and previewing a new profile picture before saving.
 */
export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const { balance, loading } = useAccountBalance()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Local state for managing profile image preview and upload flow
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showButtons, setShowButtons] = useState(false)

  // Determine which image to display: preview → user image → fallback avatar
  const imageSrc = previewImage || user.image || '/avatars/default-profile-avatar.svg'

  /** Opens the file picker when camera icon is clicked */
  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handles file selection, validates size & type, and sets preview.
   * @param e - File input change event
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Enforce 20MB file size limit
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size must be less than 20MB')
      e.target.value = ''
      return
    }

    // Restrict allowed file types to JPEG and PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG and PNG images are allowed')
      e.target.value = ''
      return
    }

    // Generate object URL for preview and store file
    const url = URL.createObjectURL(file)
    setPreviewImage(url)
    setSelectedFile(file)
    setShowButtons(true)
  }

  /**
   * Sends updated profile data (including optional image) to the backend.
   * Uses multipart/form-data to handle file uploads.
   */
  const handleSave = async () => {
    try {
      const formData = new FormData()

      // Append base user data
      formData.append('first_name', user.first_name)
      formData.append('last_name', user.last_name)
      formData.append('email', user.email)

      // Append image if available
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      const response = await fetch('/api/user/me', {
        method: 'PUT',
        body: formData, // Let browser handle Content-Type header
      })

      if (response.ok) {
        setShowButtons(false)
        if (previewImage) URL.revokeObjectURL(previewImage) // Free memory
        setPreviewImage(null)
        setSelectedFile(null)
        window.location.reload() // Simple refresh to reflect changes
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred while updating your profile')
    }
  }

  /** Cancels the image change and cleans up preview resources */
  const handleCancel = () => {
    if (previewImage) URL.revokeObjectURL(previewImage)
    setPreviewImage(null)
    setSelectedFile(null)
    setShowButtons(false)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shadow-lg bg-white/5 backdrop-blur-md border-r border-white/10 rounded-lg p-4 md:p-6 text-white">
      {/* Profile image with camera button overlay */}
      <div className="relative w-20 h-20 md:w-[150px] md:h-[150px] mx-auto md:mx-0 rounded-full border border-white/20 flex-shrink-0">
        <Image
          src={imageSrc}
          alt="User Avatar"
          width={150}
          height={150}
          className="object-cover w-full h-full rounded-full"
        />
        <button
          type="button"
          onClick={handleCameraClick}
          className="absolute bottom-2 -right-3 md:right-2 p-2 bg-[var(--button-disabled)]/60 hover:bg-[var(--button-primary)] transition-colors rounded-full scale-110 z-10"
          aria-label="Change profile photo"
        >
          <Camera className="text-white w-4 h-4 md:w-5 md:h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* User info and account balance */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">
          {user.first_name} {user.last_name}
        </h2>
        <div className="flex items-center gap-2 text-base md:text-2xl text-gray-400">
          Account Balance:{' '}
          <span className="text-[var(--success-color)]">
            {loading ? 'Loading...' : formatCurrency(balance ?? 0)}
          </span>
        </div>

        {/* Save/Cancel buttons when editing */}
        {showButtons && (
          <div className="mt-4">
            <SaveCancelButtons onSave={handleSave} onCancel={handleCancel} />
          </div>
        )}
      </div>
    </div>
  )
}
