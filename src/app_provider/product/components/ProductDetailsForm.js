import React from 'react';

export default function ProductDetailsForm({
    name,
    onNameChange,
    imageUrl,
    onImageUrlChange,
    price,
    onPriceChange,
}) {
    return (
        <>
            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="product-name">
                    Name *
                </label>
                <input
                    id="product-name"
                    className="shop-create-input"
                    placeholder="e.g. Latte"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoComplete="off"
                />
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="product-image-url">
                    Image URL
                </label>
                <input
                    id="product-image-url"
                    className="shop-create-input"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => onImageUrlChange(e.target.value)}
                    autoComplete="off"
                    inputMode="url"
                />
                {imageUrl.trim() ? (
                    <div className="shop-create-logoPreviewWrap">
                        <img
                            className="shop-create-logoPreview"
                            src={imageUrl}
                            alt="product preview"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                            onLoad={(e) => {
                                e.currentTarget.style.display = 'block';
                            }}
                        />
                    </div>
                ) : null}
            </section>

            <section className="shop-create-section">
                <label className="shop-create-label" htmlFor="product-price">
                    Price *
                </label>
                <div className="shop-create-help">
                    Enter a number (example: 199 or 199.99)
                </div>
                <input
                    id="product-price"
                    className="shop-create-input"
                    placeholder="e.g. 199.99"
                    value={price}
                    onChange={(e) => onPriceChange(e.target.value)}
                    autoComplete="off"
                    inputMode="decimal"
                />
            </section>
        </>
    );
}

