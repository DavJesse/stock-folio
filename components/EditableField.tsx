// Props for the EditableField component
interface EditableFieldProps {
  readonly label: string                 // Field label (e.g., "First Name")
  readonly value: string                 // Current value of the field
  readonly editable: boolean             // Determines if the field is editable
  readonly onChange?: (val: string) => void // Optional change handler for editable fields
}

// Reusable component for displaying a label and either:
// - An input field if editable
// - Static text if read-only
export default function EditableField({ label, value, editable, onChange }: EditableFieldProps) {
  return (
    <div>
      {/* Label for the field */}
      <label className="block text-sm text-white/60 mb-1">{label}</label>

      {editable ? (
        // Render input field if editable
        <input
          type="text"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className="bg-[var(--primary-background)] text-white py-1 px-2 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
        />
      ) : (
        // Render static text if not editable
        <p className="text-white">{value || '—'}</p>
      )}
    </div>
  )
}
