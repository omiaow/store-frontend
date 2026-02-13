import React from 'react';
import useHttp from '../../../hooks/http.hook';
import { useNavigate } from 'react-router-dom';
import { DeleteProductModal, ProductRow } from './product_item_components';

function ProductItem({ product, onDeleted }) {
  const { loading, requestWithMeta } = useHttp();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState(null);

  React.useEffect(() => {
    if (!isDeleteOpen) return;
    setDeleteError(null);
  }, [isDeleteOpen]);

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

  return (
    <>
      <ProductRow
        product={product}
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
    </>
  );
}

export default ProductItem;

