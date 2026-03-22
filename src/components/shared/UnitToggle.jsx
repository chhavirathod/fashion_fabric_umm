import React from 'react'

export default function UnitToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Unit:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm font-semibold border border-surface-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
      >
        <option value="in">Inches (in)</option>
        <option value="cm">Centimetres (cm)</option>
      </select>
    </div>
  )
}
