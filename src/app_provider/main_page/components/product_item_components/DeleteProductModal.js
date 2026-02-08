import React from 'react';
import ModalFrame from './ModalFrame';

export default function DeleteProductModal({
  isOpen,
  onClose,
  productName,
  deleteError,
  loading,
  onConfirmDelete,
}) {
  if (!isOpen) return null;

  return (
    <ModalFrame title="Удалить товар" onClose={onClose}>
      <div className="main-page-editBody">
        {deleteError ? <div className="main-page-editError">{deleteError}</div> : null}

        <div className="main-page-confirmText">
          Вы уверены, что хотите удалить «<b>{productName}</b>»?
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
            className="main-page-editButton main-page-editButtonDanger"
            onClick={onConfirmDelete}
            disabled={loading}
          >
            {loading ? 'Удаление…' : 'Удалить'}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

