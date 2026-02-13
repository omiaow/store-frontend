import React from 'react';
import ProductItem from './ProductItem';
import useHttp from '../../../hooks/http.hook';

function ProductsSection({
  skeletonCount = 4,
  selectedBranchId = null,
  onOpenReplenish,
}) {
  const { requestWithMeta } = useHttp();
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const productsPromiseByKeyRef = React.useRef(new Map());
  const lastRequestFnRef = React.useRef(null);

  const skeletonItems = React.useMemo(
    () => Array.from({ length: skeletonCount }, (_, i) => i),
    [skeletonCount]
  );

  const handleProductDeleted = React.useCallback((deletedId) => {
    if (!deletedId) return;
    setProducts((prev) =>
      prev.filter((p) => {
        const pid = p?._id ?? p?.id;
        return pid !== deletedId;
      })
    );
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    if (lastRequestFnRef.current !== requestWithMeta) {
      lastRequestFnRef.current = requestWithMeta;
      productsPromiseByKeyRef.current = new Map();
    }

    const key = selectedBranchId ? `branch:${selectedBranchId}` : 'all';
    const endpoint = selectedBranchId
      ? `/operator/products?branchId=${encodeURIComponent(selectedBranchId)}`
      : '/operator/products';

    setLoading(true);

    const cachedPromise = productsPromiseByKeyRef.current.get(key);
    const productsPromise = cachedPromise ?? requestWithMeta(endpoint, 'GET');
    if (!cachedPromise) {
      productsPromiseByKeyRef.current.set(key, productsPromise);
    }

    (async () => {
      try {
        const productsRes = await productsPromise;
        if (cancelled) return;

        if (productsRes?.ok) {
          const data = productsRes?.data;
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
        }
      } catch (_) {
        // ignore for now (view-first app)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestWithMeta, selectedBranchId]);

  return (
    <section
      className="main-page-products"
      aria-label="Products"
      aria-busy={loading ? 'true' : 'false'}
    >
      {loading ? (
        <>
          <div className="main-page-sectionHeader" aria-hidden="true">
            <div className="main-page-skeleton main-page-skeleton--text main-page-productsTitleSkeleton" />
            <div className="main-page-skeleton main-page-skeleton--text main-page-productsSubSkeleton" />
          </div>

          <div className="main-page-productList" aria-hidden="true">
            {skeletonItems.map((i) => (
              <div key={i} className="main-page-productItem main-page-productItem--skeleton">
                <div className="main-page-skeleton main-page-skeleton--block main-page-productSkeletonImage" />
                <div className="main-page-productMain">
                  <div className="main-page-skeleton main-page-skeleton--text main-page-productSkeletonName" />
                  <div className="main-page-skeleton main-page-skeleton--text main-page-productSkeletonMeta" />
                </div>
                <div className="main-page-productActions">
                  <div className="main-page-skeleton main-page-skeleton--circle main-page-productSkeletonBtn" />
                  <div className="main-page-skeleton main-page-skeleton--circle main-page-productSkeletonBtn" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="main-page-sectionHeader">
            <div className="main-page-sectionTitle">Продукты</div>
            <div className="main-page-sectionSub">
              {!selectedBranchId ?
                <span>{products.length ? `${products.length} продуктов` : 'Нет продуктов'}</span> : null}
              {selectedBranchId ? (
                <button
                  type="button"
                  className="main-page-sectionSubButton"
                  onClick={onOpenReplenish}
                >
                  Пополнить
                </button>
              ) : null}
            </div>
          </div>

          <div className="main-page-productList">
            {products.length === 0 ? (
              <div className="main-page-emptyState">Продукты будут появляться здесь.</div>
            ) : (
              products.map((p) => (
                <ProductItem
                  key={p?._id ?? p?.id}
                  product={p}
                  onDeleted={handleProductDeleted}
                />
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default ProductsSection;

