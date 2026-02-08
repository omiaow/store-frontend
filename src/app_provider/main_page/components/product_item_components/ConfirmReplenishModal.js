import React from 'react';
import ModalFrame from './ModalFrame';

export default function ConfirmReplenishModal({
  isOpen,
  onClose,
  productName,
  replenishQuantity,
  loading,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <ModalFrame title="Подтверждение пополнения" onClose={onClose}>
      <div className="main-page-editBody">
        <div className="main-page-confirmText">
          Добавить <b>{replenishQuantity || '0'}</b> шт. к <b>{productName}</b>?
        </div>
        <div className="main-page-editActions">
          <button
            type="button"
            className="main-page-editButton main-page-editButtonSecondary"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="button"
            className="main-page-editButton main-page-editButtonPrimary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Отправка…' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

