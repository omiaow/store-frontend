import React from 'react';
import useHttp from '../../../hooks/http.hook';

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
      setEditError('Missing product id');
      return;
    }

    const priceNumber = Number(String(editPrice).replace(',', '.').trim());
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setEditError('Price must be a number >= 0');
      return;
    }

    const res = await requestWithMeta('/operator/products', 'PUT', {
      productId,
      name: String(editName ?? '').trim(),
      price: priceNumber,
      imageUrl: String(editImageUrl ?? '').trim() || null,
    });

    if (!res?.ok) {
      setEditError(res?.data?.error || res?.data?.message || 'Failed to update product');
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
      setDeleteError('Missing product id');
      return;
    }

    const res = await requestWithMeta('/operator/products', 'DELETE', { productId });
    if (!res?.ok) {
      setDeleteError(res?.data?.error || res?.data?.message || 'Failed to delete product');
      return;
    }

    onDeleted?.(productId);
    setIsDeleteOpen(false);
  }

  async function handleConfirmReplenish() {
    setReplenishError(null);
    const productId = product?._id ?? product?.id;
    if (!selectedBranchId || !productId) {
      setReplenishError('Please select a branch first.');
      return;
    }

    const qty = Number(String(replenishQuantity).replace(',', '.').trim());
    if (!Number.isFinite(qty) || qty <= 0) {
      setReplenishError('Quantity must be a number > 0');
      return;
    }

    const res = await requestWithMeta(
      `/operator/stock/branch/${selectedBranchId}/product/${productId}`,
      'POST',
      { quantity: qty }
    );

    if (!res?.ok) {
      setReplenishError(res?.data?.error || res?.data?.message || 'Failed to replenish stock');
      return;
    }

    setStockCount((prev) => (typeof prev === 'number' ? prev + qty : prev));
    setIsReplenishConfirmOpen(false);
    setIsReplenishOpen(false);
  }

  return (
    <>
      <div className="main-page-productItem">
        <img
          className="main-page-productImage"
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
        />

        <div className="main-page-productMain">
          <div className="main-page-productName">{product.name}</div>
          <div className="main-page-productMeta">{product.price}</div>
        </div>

        <div className="main-page-productActions">
          {selectedBranchId ? (
            <button
              type="button"
              className="main-page-iconButton"
              onClick={() => setIsReplenishOpen(true)}
              aria-label="Replenish"
              title="Replenish"
            >
              <svg
                className="main-page-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}

          <button
            type="button"
            className="main-page-iconButton"
            onClick={() => setIsEditOpen(true)}
            aria-label="Edit"
            title="Edit"
          >
            <svg
              className="main-page-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 15.9V20z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 6.5l4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="main-page-iconButton"
            onClick={() => setIsDeleteOpen(true)}
            aria-label="Delete"
            title="Delete"
          >
            <svg
              className="main-page-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 12V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 12V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 7H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {isEditOpen ? (
        <div className="main-page-modalOverlay" onClick={() => setIsEditOpen(false)}>
          <div className="main-page-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="main-page-modalHeader">
              <div className="main-page-modalTitle">Edit product</div>
              <button
                type="button"
                className="main-page-modalClose"
                onClick={() => setIsEditOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="main-page-editBody">
              {editError ? <div className="main-page-editError">{editError}</div> : null}

              <label className="main-page-editLabel">
                Name
                <input
                  className="main-page-editInput"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Product name"
                />
              </label>

              <label className="main-page-editLabel">
                Price
                <input
                  className="main-page-editInput"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="0"
                  inputMode="decimal"
                />
              </label>

              <label className="main-page-editLabel">
                Image URL
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
                  onClick={() => setIsEditOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonPrimary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteOpen ? (
        <div className="main-page-modalOverlay" onClick={() => setIsDeleteOpen(false)}>
          <div className="main-page-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="main-page-modalHeader">
              <div className="main-page-modalTitle">Delete product</div>
              <button
                type="button"
                className="main-page-modalClose"
                onClick={() => setIsDeleteOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="main-page-editBody">
              {deleteError ? (
                <div className="main-page-editError">{deleteError}</div>
              ) : null}

              <div className="main-page-confirmText">
                Are you sure you want to delete <b>{product?.name}</b>?
              </div>

              <div className="main-page-editActions">
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonSecondary"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonDanger"
                  onClick={handleConfirmDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isReplenishOpen ? (
        <div className="main-page-modalOverlay" onClick={() => setIsReplenishOpen(false)}>
          <div className="main-page-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="main-page-modalHeader">
              <div className="main-page-modalTitle">
                Replenish stock
                <div className="main-page-modalSubtitle">
                  Current stock: {stockCount === null ? '—' : stockCount}
                </div>
              </div>
              <button
                type="button"
                className="main-page-modalClose"
                onClick={() => setIsReplenishOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="main-page-editBody">
              {replenishError ? (
                <div className="main-page-editError">{replenishError}</div>
              ) : null}

              <label className="main-page-editLabel">
                Quantity to add
                <input
                  className="main-page-editInput"
                  value={replenishQuantity}
                  onChange={(e) => setReplenishQuantity(e.target.value)}
                  placeholder="e.g. 10"
                  inputMode="numeric"
                />
              </label>

              <div className="main-page-editActions">
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonSecondary"
                  onClick={() => setIsReplenishOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonPrimary"
                  onClick={() => setIsReplenishConfirmOpen(true)}
                  disabled={loading}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isReplenishConfirmOpen ? (
        <div
          className="main-page-modalOverlay"
          onClick={() => setIsReplenishConfirmOpen(false)}
        >
          <div className="main-page-modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="main-page-modalHeader">
              <div className="main-page-modalTitle">Confirm replenishment</div>
              <button
                type="button"
                className="main-page-modalClose"
                onClick={() => setIsReplenishConfirmOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="main-page-editBody">
              <div className="main-page-confirmText">
                Add <b>{replenishQuantity || '0'}</b> items to <b>{product?.name}</b>?
              </div>
              <div className="main-page-editActions">
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonSecondary"
                  onClick={() => setIsReplenishConfirmOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="main-page-editButton main-page-editButtonPrimary"
                  onClick={handleConfirmReplenish}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ProductItem;

