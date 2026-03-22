import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title=" " size="sm">
      <div className="text-center pb-2">
        <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <h3 className="font-display font-semibold text-surface-900 text-base mb-2">{title}</h3>
        <p className="text-sm text-surface-500">{message}</p>
        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose() }}>
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  )
}
