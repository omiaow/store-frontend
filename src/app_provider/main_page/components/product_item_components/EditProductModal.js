import React from 'react';
import ModalFrame from './ModalFrame';

export default function EditProductModal({
  isOpen,
  onClose,
  editError,
  editName,
  setEditName,
  editPrice,
  setEditPrice,
  editImageUrl,
  setEditImageUrl,
  loading,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <ModalFrame title="Редактировать товар" onClose={onClose}>
      <div className="main-page-editBody">
        {editError ? <div className="main-page-editError">{editError}</div> : null}

        <label className="main-page-editLabel">
          Название
          <input
            className="main-page-editInput"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Название товара"
          />
        </label>

        <label className="main-page-editLabel">
          Цена
          <input
            className="main-page-editInput"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            placeholder="0"
            inputMode="decimal"
          />
        </label>

        <label className="main-page-editLabel">
          Ссылка на изображение
          <input
            className="main-page-editInput"
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            placeholder="https://..."
            autoComplete="off"
          />
        </label>

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
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

