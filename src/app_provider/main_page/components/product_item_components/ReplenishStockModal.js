import React from 'react';
import ModalFrame from './ModalFrame';

export default function ReplenishStockModal({
  isOpen,
  onClose,
  stockCount,
  replenishError,
  replenishQuantity,
  setReplenishQuantity,
  loading,
  onOpenConfirm,
}) {
  if (!isOpen) return null;

  return (
    <ModalFrame
      title="Пополнить товар"
      subtitle={`Текущее количество: ${stockCount === null ? '—' : stockCount}`}
      onClose={onClose}
    >
      <div className="main-page-editBody">
        {replenishError ? (
          <div className="main-page-editError">{replenishError}</div>
        ) : null}

        <label className="main-page-editLabel">
          Количество для пополнения
          <input
            className="main-page-editInput"
            value={replenishQuantity}
            onChange={(e) => setReplenishQuantity(e.target.value)}
            placeholder="например, 10 шт."
            inputMode="numeric"
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
            onClick={onOpenConfirm}
            disabled={loading}
          >
            Отправить
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

