import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Sil", cancelText = "İptal", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <button className="confirm-modal-close" onClick={onClose} aria-label="Kapat">
                    <X size={18} />
                </button>
                <div className="confirm-modal-icon-wrapper">
                    <AlertTriangle size={32} />
                </div>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <button type="button" className="btn-outline btn-confirm-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button 
                        type="button" 
                        className={`btn-confirm ${type === 'danger' ? 'btn-danger-custom' : 'btn-primary-custom'}`} 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
