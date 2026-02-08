import React from 'react';
import { CloseIcon } from './icons';

function ModalCloseButton({ onClick }) {
  return (
    <button
      type="button"
      className="main-page-modalClose"
      onClick={onClick}
      aria-label="Закрыть"
      title="Закрыть"
    >
      <CloseIcon />
    </button>
  );
}

export default function ModalFrame({ title, subtitle, onClose, children }) {
  return (
    <div className="main-page-modalOverlay" onClick={onClose}>
      <div className="main-page-modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="main-page-modalHeader">
          <div className="main-page-modalTitle">
            {title}
            {subtitle ? <div className="main-page-modalSubtitle">{subtitle}</div> : null}
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {children}
      </div>
    </div>
  );
}

