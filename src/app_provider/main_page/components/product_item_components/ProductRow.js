import React from 'react';
import IconButton from './IconButton';
import { EditIcon, TrashIcon } from './icons';

function getQuantityToneClass(quantity) {
  if (!Number.isFinite(quantity) || quantity <= 0) return 'main-page-productQty--red';
  if (quantity <= 5) return 'main-page-productQty--orange';
  if (quantity <= 15) return 'main-page-productQty--yellow';
  return 'main-page-productQty--green';
}

export default function ProductRow({ product, onEdit, onDelete }) {
  const parsedQuantity = Number(product?.quantity);
  const quantity = Number.isFinite(parsedQuantity) ? parsedQuantity : 0;
  const quantityClassName = getQuantityToneClass(quantity);

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
        <div className="main-page-productMeta">
          <span>{product.price} сом</span>
          <span className={`main-page-productQty ${quantityClassName}`}>{quantity} шт.</span>
        </div>
      </div>

      <div className="main-page-productActions">
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

