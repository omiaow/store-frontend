import React from 'react';
import IconButton from './IconButton';
import { EditIcon, ReplenishIcon, TrashIcon } from './icons';

export default function ProductRow({
  product,
  selectedBranchId,
  onEdit,
  onDelete,
  onReplenish,
}) {
  return (
    <div className="main-page-productItem">
      <img
        className="main-page-productImage"
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
      />

      <div className="main-page-productMain">
        <div className="main-page-productName">{product.name}</div>
        <div className="main-page-productMeta">{product.price} сом</div>
      </div>

      <div className="main-page-productActions">
        {selectedBranchId ? (
          <IconButton onClick={onReplenish} label="Пополнить" title="Пополнить">
            <ReplenishIcon />
          </IconButton>
        ) : null}

        <IconButton onClick={onEdit} label="Редактировать" title="Редактировать">
          <EditIcon />
        </IconButton>

        <IconButton onClick={onDelete} label="Удалить" title="Удалить">
          <TrashIcon />
        </IconButton>
      </div>
    </div>
  );
}

