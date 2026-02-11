import React from 'react';
import useHttp from '../../../hooks/http.hook';
import { useNavigate } from 'react-router-dom';
import {
  ConfirmReplenishModal,
  DeleteProductModal,
  ProductRow,
  ReplenishStockModal,
} from './product_item_components';

function ProductItem({ product, selectedBranchId, onUpdated, onDeleted }) {
  const { loading, requestWithMeta } = useHttp();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isReplenishOpen, setIsReplenishOpen] = React.useState(false);
  const [isReplenishConfirmOpen, setIsReplenishConfirmOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState(null);
  const [stockCount, setStockCount] = React.useState(null);
  const [replenishQuantity, setReplenishQuantity] = React.useState('');
  const [replenishError, setReplenishError] = React.useState(null);

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

  function handleEdit() {
    const productId = product?._id ?? product?.id;
    if (!productId) return;
    navigate(`/provider/product/${productId}/edit`, { state: { product } });
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
        onEdit={handleEdit}
        onDelete={() => setIsDeleteOpen(true)}
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

