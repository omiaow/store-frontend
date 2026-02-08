import React from 'react';
import useHttp from '../../../hooks/http.hook';
import {
  ConfirmReplenishModal,
  DeleteProductModal,
  EditProductModal,
  ProductRow,
  ReplenishStockModal,
} from './product_item_components';

function ProductItem({ product, selectedBranchId, onUpdated, onDeleted }) {
  const { loading, requestWithMeta } = useHttp();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isReplenishOpen, setIsReplenishOpen] = React.useState(false);
  const [isReplenishConfirmOpen, setIsReplenishConfirmOpen] = React.useState(false);
  const [editName, setEditName] = React.useState(product?.name ?? '');
  const [editPrice, setEditPrice] = React.useState(
    product?.price !== undefined && product?.price !== null ? String(product.price) : ''
  );
  const [editImageUrl, setEditImageUrl] = React.useState(product?.imageUrl ?? '');
  const [editError, setEditError] = React.useState(null);
  const [deleteError, setDeleteError] = React.useState(null);
  const [stockCount, setStockCount] = React.useState(null);
  const [replenishQuantity, setReplenishQuantity] = React.useState('');
  const [replenishError, setReplenishError] = React.useState(null);

  React.useEffect(() => {
    if (!isEditOpen) return;
    setEditName(product?.name ?? '');
    setEditPrice(
      product?.price !== undefined && product?.price !== null ? String(product.price) : ''
    );
    setEditImageUrl(product?.imageUrl ?? '');
    setEditError(null);
  }, [isEditOpen, product]);

  React.useEffect(() => {
    if (!isDeleteOpen) return;
    setDeleteError(null);
  }, [isDeleteOpen]);

  React.useEffect(() => {
    if (!isReplenishOpen) return;
    setReplenishError(null);
    setIsReplenishConfirmOpen(false);
    setReplenishQuantity('');
    setStockCount(null);

    async function loadStock() {
      const productId = product?._id ?? product?.id;
      if (!selectedBranchId || !productId) return;

      const res = await requestWithMeta(
        `/operator/stock/branch/${selectedBranchId}/product/${productId}`,
        'GET'
      );

      if (!res?.ok) return;
      setStockCount(res?.data?.stockCount ?? null);
    }

    loadStock();
  }, [isReplenishOpen, product, requestWithMeta, selectedBranchId]);

  async function handleSave() {
    setEditError(null);
    const productId = product?._id ?? product?.id;
    if (!productId) {
      setEditError('Не найден идентификатор товара');
      return;
    }

    const priceNumber = Number(String(editPrice).replace(',', '.').trim());
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setEditError('Цена должна быть числом >= 0');
      return;
    }

    const res = await requestWithMeta('/operator/products', 'PUT', {
      productId,
      name: String(editName ?? '').trim(),
      price: priceNumber,
      imageUrl: String(editImageUrl ?? '').trim() || null,
    });

    if (!res?.ok) {
      setEditError(res?.data?.error || res?.data?.message || 'Не удалось обновить товар');
      return;
    }

    const updated = res?.data?.product
      ? { ...res.data.product, _id: res.data.product.id, id: res.data.product.id }
      : null;

    if (updated) onUpdated?.(updated);
    setIsEditOpen(false);
  }

  async function handleConfirmDelete() {
    setDeleteError(null);
    const productId = product?._id ?? product?.id;
    if (!productId) {
      setDeleteError('Не найден идентификатор товара');
      return;
    }

    const res = await requestWithMeta('/operator/products', 'DELETE', { productId });
    if (!res?.ok) {
      setDeleteError(res?.data?.error || res?.data?.message || 'Не удалось удалить товар');
      return;
    }

    onDeleted?.(productId);
    setIsDeleteOpen(false);
  }

  async function handleConfirmReplenish() {
    setReplenishError(null);
    const productId = product?._id ?? product?.id;
    if (!selectedBranchId || !productId) {
      setReplenishError('Пожалуйста, сначала выберите филиал.');
      return;
    }

    const qty = Number(String(replenishQuantity).replace(',', '.').trim());
    if (!Number.isFinite(qty) || qty <= 0) {
      setReplenishError('Количество должно быть числом > 0');
      return;
    }

    const res = await requestWithMeta(
      `/operator/stock/branch/${selectedBranchId}/product/${productId}`,
      'POST',
      { quantity: qty }
    );

    if (!res?.ok) {
      setReplenishError(res?.data?.error || res?.data?.message || 'Не удалось пополнить остаток');
      return;
    }

    setStockCount((prev) => (typeof prev === 'number' ? prev + qty : prev));
    setIsReplenishConfirmOpen(false);
    setIsReplenishOpen(false);
  }

  return (
    <>
      <ProductRow
        product={product}
        selectedBranchId={selectedBranchId}
        onReplenish={() => setIsReplenishOpen(true)}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editError={editError}
        editName={editName}
        setEditName={setEditName}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editImageUrl={editImageUrl}
        setEditImageUrl={setEditImageUrl}
        loading={loading}
        onSave={handleSave}
      />

      <DeleteProductModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        productName={product?.name}
        deleteError={deleteError}
        loading={loading}
        onConfirmDelete={handleConfirmDelete}
      />

      <ReplenishStockModal
        isOpen={isReplenishOpen}
        onClose={() => setIsReplenishOpen(false)}
        stockCount={stockCount}
        replenishError={replenishError}
        replenishQuantity={replenishQuantity}
        setReplenishQuantity={setReplenishQuantity}
        loading={loading}
        onOpenConfirm={() => setIsReplenishConfirmOpen(true)}
      />

      <ConfirmReplenishModal
        isOpen={isReplenishConfirmOpen}
        onClose={() => setIsReplenishConfirmOpen(false)}
        productName={product?.name}
        replenishQuantity={replenishQuantity}
        loading={loading}
        onConfirm={handleConfirmReplenish}
      />
    </>
  );
}

export default ProductItem;

