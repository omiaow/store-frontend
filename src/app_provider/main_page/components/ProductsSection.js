import React from 'react';
import ProductItem from './ProductItem';

function ProductsSection({
  products = [],
  selectedBranchId,
  onProductUpdated,
  onProductDeleted,
}) {
  return (
    <section className="main-page-products" aria-label="Products">
      <div className="main-page-sectionHeader">
        <div className="main-page-sectionTitle">Products</div>
        <div className="main-page-sectionSub">
          {products.length ? `${products.length} items` : 'No products yet'}
        </div>
      </div>

      <div className="main-page-productList">
        {products.length === 0 ? (
          <div className="main-page-emptyState">Products will appear here.</div>
        ) : (
          products.map((p) => (
            <ProductItem
              key={p?._id ?? p?.id}
              product={p}
              selectedBranchId={selectedBranchId}
              onUpdated={onProductUpdated}
              onDeleted={onProductDeleted}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default ProductsSection;

