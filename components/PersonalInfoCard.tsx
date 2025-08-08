import { useState } from 'react'
import EditableField from '@/components/EditableField'
import SaveCancelButtons from '@/components/SaveCancelButtons'
import { User } from '@/types/user'

/**
 * PersonalInfoCard component
 * --------------------------
 * Displays the user's personal information in a card layout.
 * Allows toggling between view mode and edit mode to update user data.
 * Updates are sent to the `/api/user/me` endpoint when saved.
 */
export default function PersonalInfoCard({ user }: { readonly user: User }) {
  // State to control whether the form is in edit mode
  const [editMode, setEditMode] = useState(false)

  // State holding a copy of the user's data being edited
  const [formData, setFormData] = useState(user)

  /**
   * Updates a specific field in the form data state.
   * @param field - The key of the user object to update.
   * @param value - The new value for the field.
   */
  const handleChange = (field: keyof User, value: User[keyof User]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  /**
   * Sends updated user data to the backend and exits edit mode.
   * Makes a PUT request to `/api/user/me` with updated user information.
   */
  const handleSave = async () => {
    await fetch('/api/user/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    setEditMode(false)
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border-r border-white/10 rounded-lg p-6 text-white">
      {/* Header with title and Edit/Cancel button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <button
          onClick={() => setEditMode(prev => !prev)}
          className="text-sm border border-white/20 px-3 py-1 rounded hover:bg-white/10"
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Editable fields for user details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="First Name"
          value={formData.first_name}
          editable={editMode}
          onChange={val => handleChange('first_name', val)}
        />
        <EditableField
          label="Last Name"
          value={formData.last_name}
          editable={editMode}
          onChange={val => handleChange('last_name', val)}
        />
        <EditableField
          label="Email Address"
          value={formData.email}
          editable={editMode}
          onChange={val => handleChange('email', val)}
        />
        {/* User role is always read-only */}
        <EditableField
          label="User Role"
          value="User"
          editable={false}
        />
      </div>

      {/* Save/Cancel buttons - only visible in edit mode */}
      {editMode && (
        <SaveCancelButtons
          onSave={handleSave}
          onCancel={() => setEditMode(false)}
        />
      )}
    </div>
  )
}
