"use client"

import { useState } from "react"
import EditablePasswordField from "@/components/EditablePasswordField"
import SaveCancelButtons from "@/components/SaveCancelButtons"

export default function ChangePasswordCard() {
  // Controls whether password fields are editable
  const [editable, setEditable] = useState(false)

  // Stores form input values
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Stores status messages
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  /**
   * Handles saving the new password
   * - Validates that the new password matches the confirmation
   * - Sends a PUT request to update the password
   * - Displays success or error messages based on the result
   */
  const handleSave = async () => {
    // Reset status messages
    setError("")
    setSuccess("")

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    try {
      // Send password update request
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Password change failed")

      // If successful, reset form and show success message
      setSuccess("Password updated successfully!")
      setEditable(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      // Show error message
      if (err instanceof Error) setError(err.message)
      else setError("Something went wrong.")
    }
  }

  /**
   * Handles canceling password changes
   * - Resets form inputs
   * - Clears messages
   * - Disables edit mode
   */
  const handleCancel = () => {
    setEditable(false)
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border-r border-white/10 rounded-lg p-6 text-white">
      {/* Card header with Edit button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Change Password</h2>
        {!editable && (
          <button
            onClick={() => setEditable(true)}
            className="text-sm border border-white/20 px-3 py-1 rounded hover:bg-white/10"
          >
            Edit
          </button>
        )}
      </div>

      {/* Status messages */}
      {error && <p className="text-[var(--warning-color)] mb-2">{error}</p>}
      {success && <p className="text-[var(--success-color)] mb-2">{success}</p>}

      {/* Password fields */}
      <div className="space-y-4">
        <EditablePasswordField
          label="Old Password"
          value={oldPassword}
          editable={editable}
          onChange={setOldPassword}
        />
        <EditablePasswordField
          label="New Password"
          value={newPassword}
          editable={editable}
          onChange={setNewPassword}
        />
        <EditablePasswordField
          label="Confirm New Password"
          value={confirmPassword}
          editable={editable}
          onChange={setConfirmPassword}
        />
      </div>

      {/* Save & Cancel buttons (only visible in edit mode) */}
      {editable && (
        <SaveCancelButtons onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  )
}
