// Props definition for SaveCancelButtons component
// - onSave: function to execute when "Save" is clicked
// - onCancel: function to execute when "Cancel" is clicked
interface SaveCancelButtonsProps {
  readonly onSave: () => void
  readonly onCancel: () => void
}

// Reusable component for rendering "Save" and "Cancel" buttons
// - Save button: triggers the onSave function and uses the primary button color
// - Cancel button: triggers the onCancel function and uses a translucent white background
export default function SaveCancelButtons({ onSave, onCancel }: SaveCancelButtonsProps) {
  return (
    <div className="flex gap-4 mt-6">
      {/* Save button */}
      <button
        onClick={onSave}
        className="bg-[var(--button-primary)] px-4 py-2 rounded text-white hover:scale-105"
      >
        Save
      </button>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="bg-white/10 px-4 py-2 rounded text-white hover:bg-white/20"
      >
        Cancel
      </button>
    </div>
  )
}
