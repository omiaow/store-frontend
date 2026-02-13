import React from 'react';
import ProductItem from './ProductItem';

function ProductsSection({
  products = [],
  loading = false,
  skeletonCount = 4,
  selectedBranchId = null,
  onOpenReplenish,
  onProductDeleted,
}) {
  const skeletonItems = React.useMemo(
    () => Array.from({ length: skeletonCount }, (_, i) => i),
    [skeletonCount]
  );

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
              <span>{products.length ? `${products.length} продуктов` : 'Нет продуктов'}</span>
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
                  onDeleted={onProductDeleted}
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

