import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useHttp from '../../hooks/http.hook';
import '../shop/Shop.css';
import './ReplenishPage.css';
import CreateShopHeader from '../shop/components/CreateShopHeader';
import CreateFooter from '../shop/components/CreateFooter';

function ReplenishPage() {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const { loading, requestWithMeta } = useHttp();

  const [products, setProducts] = React.useState([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [submitError, setSubmitError] = React.useState(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(null);
  const [selectionById, setSelectionById] = React.useState({});

  const fetchProducts = React.useCallback(async () => {
    if (!branchId) return;
    setProductsLoading(true);
    try {
      const res = await requestWithMeta(
        `/operator/products?branchId=${encodeURIComponent(branchId)}`,
        'GET'
      );

      if (!res?.ok) {
        setSubmitError(res?.data?.error || res?.data?.message || 'Не удалось загрузить товары');
        return;
      }

      const data = res?.data;
      const listRaw = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];

      const normalized = listRaw.map((p) => {
        const id = p?._id ?? p?.id;
        return {
          ...p,
          _id: id,
          id,
          imageUrl: p?.imageUrl ?? p?.image_url ?? null,
        };
      });

      setProducts(normalized);
      setSelectionById((prev) => {
        const next = {};
        normalized.forEach((p) => {
          const id = p?._id ?? p?.id;
          if (!id) return;
          next[id] = prev[id] || { checked: false, quantity: '' };
        });
        return next;
      });
    } finally {
      setProductsLoading(false);
    }
  }, [branchId, requestWithMeta]);

  React.useEffect(() => {
    if (!branchId) {
      navigate('/provider/branch/store', { replace: true });
      return;
    }
    fetchProducts();
  }, [branchId, fetchProducts, navigate]);

  const selectedCount = React.useMemo(() => {
    return Object.values(selectionById).filter((x) => x?.checked).length;
  }, [selectionById]);

  const isSubmitDisabled = loading || productsLoading || selectedCount === 0;

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitSuccess(null);

    const selectedPayload = products
      .map((p) => {
        const id = p?._id ?? p?.id;
        const state = selectionById[id];
        if (!id || !state?.checked) return null;

        const parsed = Number(String(state.quantity ?? '').replace(',', '.').trim());
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return { invalid: true };
        }

        return { productId: id, quantity: parsed };
      })
      .filter(Boolean);

    if (selectedPayload.length === 0) {
      setSubmitError('Выберите хотя бы один товар');
      return;
    }

    if (selectedPayload.some((x) => x.invalid)) {
      setSubmitError('Количество должно быть числом больше 0 для всех отмеченных товаров');
      return;
    }

    const res = await requestWithMeta(`/operator/stock/branch/${branchId}/products`, 'POST', {
      products: selectedPayload,
    });

    if (!res?.ok) {
      setSubmitError(res?.data?.error || res?.data?.message || 'Не удалось пополнить товары');
      return;
    }

    setSubmitSuccess('Пополнение успешно отправлено');
    setSelectionById((prev) => {
      const next = {};
      Object.keys(prev).forEach((id) => {
        next[id] = { checked: false, quantity: '' };
      });
      return next;
    });
    fetchProducts();
  }

  return (
    <div className="shop-create-root replenish-page-root">
      <div className="shop-create-mobile">
        <CreateShopHeader
          title="Пополнение товаров"
          subtitle="Выберите товары и укажите количество"
          onBack={() => navigate(`/provider/branch/${branchId}`)}
        />

        <main className="shop-create-content">
          {submitError ? (
            <section className="shop-create-section shop-create-sectionError">
              <div className="shop-create-label">Ошибка</div>
              <div className="shop-create-help shop-create-helpTight">{submitError}</div>
            </section>
          ) : null}

          {submitSuccess ? (
            <section className="shop-create-section replenish-page-sectionSuccess">
              <div className="shop-create-label">Готово</div>
              <div className="shop-create-help shop-create-helpTight">{submitSuccess}</div>
            </section>
          ) : null}

          <section className="shop-create-section">
            <div className="replenish-page-listHeader">
              <div className="shop-create-label replenish-page-listTitle">Товары</div>
              <div className="shop-create-help shop-create-helpTight">
                {productsLoading ? 'Загрузка…' : `${products.length} товаров`}
              </div>
            </div>

            <div className="replenish-page-list">
              {productsLoading ? (
                <div className="shop-create-help">Загружаем список товаров…</div>
              ) : products.length === 0 ? (
                <div className="shop-create-help">Товары не найдены.</div>
              ) : (
                products.map((product) => {
                  const productId = product?._id ?? product?.id;
                  const selection = selectionById[productId] || {
                    checked: false,
                    quantity: '',
                  };

                  return (
                    <label key={productId} className="replenish-page-item">
                      <img
                        className="replenish-page-image"
                        src={product?.imageUrl || ''}
                        alt={product?.name || 'product'}
                        loading="lazy"
                      />

                      <div className="replenish-page-name">{product?.name || 'Без названия'}</div>

                      <input
                        type="checkbox"
                        checked={!!selection.checked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectionById((prev) => ({
                            ...prev,
                            [productId]: {
                              ...(prev[productId] || { quantity: '' }),
                              checked,
                            },
                          }));
                        }}
                        className="replenish-page-checkbox"
                        aria-label={`Выбрать ${product?.name || 'товар'}`}
                      />

                      <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        className="replenish-page-qtyInput"
                        value={selection.quantity}
                        onChange={(e) => {
                          const quantity = e.target.value;
                          setSelectionById((prev) => ({
                            ...prev,
                            [productId]: {
                              ...(prev[productId] || { checked: false }),
                              quantity,
                            },
                          }));
                        }}
                        placeholder="0"
                        disabled={!selection.checked}
                        aria-label={`Количество для ${product?.name || 'товара'}`}
                      />
                    </label>
                  );
                })
              )}
            </div>
          </section>
        </main>

        <CreateFooter
          disabled={isSubmitDisabled}
          label={loading ? 'Отправка…' : 'Пополнить выбранные'}
          onCreate={handleSubmit}
        />
      </div>
    </div>
  );
}

export default ReplenishPage;
