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
          className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
        />
      ) : (
        // Render static text if not editable
        <p className="text-white">{value || '—'}</p>
      )}
    </div>
  )
}
